const fs = require('fs')
const readline = require('readline')
const arg = require('arg')
const { PrivateKeyWASM } = require('pshenmic-dpp')
const { IdentityCreditTransferWASM, IdentifierWASM, IdentityCreditWithdrawalTransitionWASM, CoreScriptWASM } = require('pshenmic-dpp')
const { DashPlatformSDK } = require('dash-platform-sdk')

const parseArguments = require('./src/parseArguments')
const fetchIdentity = require('./src/fetchIdentity')
const transfer = require('./src/transfer')
const withdrawal = require('./src/withdrawal')

const args = arg({
  '--amount': String,
  '--type': String,
  '--recipient': String,
  '--private-keys-path': String,
  '--network': String,
  '--fee': Number,

  '-a': '--amount',
  '-f': '--fee',
  '-r': '--recipient',
  '-p': '--private-keys-path',
  '-n': '--network',
})

const { fee, network, type, amount, privateKeysFullPath, recipient} = parseArguments(args)

const sdk = new DashPlatformSDK({ network })

var rd = readline.createInterface({
  input: fs.createReadStream(privateKeysFullPath),
  console: false
})

rd.on('line', function(line) {
  const [wifOrHex,proTxHash] = line.trim().split(':')

  let privateKey

  try {
    if (wifOrHex.length === 32) {
      privateKey = PrivateKeyWASM.fromHex(wifOrHex, network)
    } else {
      privateKey = PrivateKeyWASM.fromWIF(wifOrHex)
    }
  } catch (e) {
    console.error('Error during importing private key, skipping')
    console.error(e)

    return
  }


  // todo check network of private key

  processSend(privateKey, proTxHash)
    .catch((err) => console.error(`Error during processing private key (${wifOrHex.substring(0,8)}....): ${err.message ?? err.toString()}`))
    .finally(() => console.log())
});

/**
 *
 * @param privateKey {PrivateKeyWASM}
 * @param proTxHash {string}
 * @return {Promise<void>}
 */
const processSend = async (privateKey, proTxHash) => {
  const identity = await fetchIdentity(sdk, privateKey.getPublicKeyHash(), proTxHash)

  if (identity == null) {
    throw new Error(`Could not find identity in the network. If you do mass withdrawal try supplying proTxHash after your private key in format privateKey:proTxHash per each line`)
  }

  const [identityPublicKey] = identity.getPublicKeys()
    .filter(identityPublicKey => identityPublicKey.getPublicKeyHash() === privateKey.getPublicKeyHash())

  if (identityPublicKey == null) {
    throw new Error(`Could not find matching public key for your private key in Identity ${identity.id.base58()}`)
  }

  if (identityPublicKey.purpose !== 'TRANSFER' &&
    identityPublicKey.purpose !== 'OWNER' &&
    identityPublicKey.securityLevel !== 'CRITICAL') {
    throw new Error('Wrong private key supplied, should be purpose TRANSFER or OWNER and security level CRITICAL')
  }

  if (identityPublicKey.keyId === 1 && identityPublicKey.purpose === 'OWNER' && recipient != null) {
    throw new Error('Recipient can not be set if withdrawal happens with OWNER key')
  }

  const balance = await sdk.identities.getIdentityBalance(identity.id)
  const identityNonce = (await sdk.identities.getIdentityNonce(identity.id)) + BigInt(1)

  console.log(`Identity ${identity.id.base58()}, balance: ${balance} credits.`)

  const amountToSend = (amount ? BigInt(amount) : balance) - fee

  if (amountToSend + fee > balance) {
    throw new Error(`Not enough balance, balance: ${balance} amount to send: ${amountToSend}, fee: ${fee} ${amountToSend + fee}`)
  }

  let stateTransition

  const coreScript = CoreScriptWASM.newP2PKH(sdk.utils.hexToBytes(privateKey.getPublicKeyHash()))

  if (type === 'transfer') {
    stateTransition = await transfer(amount, identity.id, recipient, identityNonce)
  } else if (type === 'withdrawal') {
    stateTransition = await withdrawal(amount, identity.id, identityNonce, coreScript)
  } else {
    throw new Error('Unknown send type')
  }

  console.log(`Transaction hex: ${stateTransition.hex()}`)

  await stateTransition.sign(privateKey, identityPublicKey)

  await sdk.stateTransitions.broadcast(stateTransition)

  console.log(`Transaction successfully broadcasted ${stateTransition.hash(true)}`)
}
