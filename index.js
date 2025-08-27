const path = require('path')
const fs = require('fs')
const readline = require('readline')
const arg = require('arg')
const { PrivateKeyWASM } = require('pshenmic-dpp')
const { IdentityCreditTransferWASM, IdentifierWASM, IdentityCreditWithdrawalTransitionWASM, CoreScriptWASM } = require('pshenmic-dpp')
const { Script, Address } = require('@dashevo/dashcore-lib')
const { DashPlatformSDK } = require('dash-platform-sdk')

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


const amount = args['--amount']
const type = args['--type']
const recipient = args['--recipient']
const privateKeysPath = args['--private-keys-path']
const network = args['--network']

if (!type) {
  throw new Error('Type of mass send must be specified via --type flag')
}
if (type !== 'transfer' && type !== 'withdraw') {
  throw new Error(`Mass send type must be either 'transfer' or 'withdraw'`)
}

if (network !== 'testnet' && network !== 'mainnet') {
  throw new Error('Network could only testnet or mainnet')
}
if (!network) {
  throw new Error('Network must be specified via --network flag')
}

if (network !== 'testnet' && network !== 'mainnet') {
  throw new Error('Network could only testnet or mainnet')
}

if (!recipient) {
  throw new Error('Specify the recipient of the funds via --recipient flag')
}

if (!privateKeysPath) {
  throw new Error('Please provide path to file with private keys via --private-keys-path flag')
}

const DEFAULT_FEE = type === 'transfer' ? 3000000 : 400000000
const fee = BigInt(args['--fee'] ?? DEFAULT_FEE)
const filePath = path.join(process.cwd(), privateKeysPath)

if (!fs.existsSync(filePath)) {
  throw new Error(`Could not find private keys file at path ${filePath}`)
}

const sdk = new DashPlatformSDK({ network })

var rd = readline.createInterface({
  input: fs.createReadStream(filePath),
  console: false
})

const run = async (privateKey) => {
  let uniqueIdentity, identity

  try {
    uniqueIdentity = await sdk.identities.getIdentityByPublicKeyHash(privateKey.getPublicKeyHash())
  } catch (e) {
  }

  let nonUniqueIdentity

  try {
    nonUniqueIdentity = await sdk.identities.getIdentityByNonUniquePublicKeyHash(privateKey.getPublicKeyHash())
  } catch (e) {
  }

  [identity] = [uniqueIdentity, nonUniqueIdentity].filter(e => e != null)

  if (identity == null) {
    return
  }

  const [identityPublicKey] = identity.getPublicKeys().filter(identityPublicKey => identityPublicKey.getPublicKeyHash() === privateKey.getPublicKeyHash())

  if (type === 'transfer' &&identityPublicKey.purpose !== 'TRANSFER' && identityPublicKey.securityLevel !== 'CRITICAL') {
    throw new Error('Wrong private key supplied, should be purpose TRANSFER and security level CRITICAL')
  }

  if (type === 'withdraw' && identityPublicKey.purpose !== 'TRANSFER' && identityPublicKey.purpose !== 'OWNER' && identityPublicKey.securityLevel !== 'CRITICAL') {
    throw new Error('Wrong private key supplied, should be purpose TRANSFER or OWNER and security level CRITICAL')
  }

  const balance = await sdk.identities.getIdentityBalance(identity.id)

  const identityNonce = await sdk.identities.getIdentityNonce(identity.id)

  const amountToSend = (amount ? BigInt(amount) : balance) - fee

  if (amountToSend + fee > balance) {
    throw new Error(`Not enough balance, balance: ${balance} amount to send: ${amountToSend}, fee: ${fee} ${amountToSend+ fee}`)
  }

  console.log(`Identity: ${identity.id.base58()}, Balance: ${balance} credits, withdrawing to ${recipient}, Fee ${fee} credits, Amount ${amountToSend}`)

  let transition

  if (type === 'transfer') {
    transition = new IdentityCreditTransferWASM(amountToSend, identity.id, new IdentifierWASM(recipient), identityNonce + 1n)
  } else if (type === 'withdraw') {
    const outputScript = Script.buildPublicKeyHashOut(Address.fromString(recipient, network))

    transition = new IdentityCreditWithdrawalTransitionWASM(identity.id, amountToSend, 2, 0, CoreScriptWASM.newP2PKH(outputScript.getData()), identityNonce + 1n)
  } else {
    throw new Error('Unknown send type')
  }

  const stateTransition = transition.toStateTransition()

  await stateTransition.sign(privateKey, identityPublicKey)

  await sdk.stateTransitions.broadcast(stateTransition)
}

rd.on('line', function(line) {
  const wifOrHex = line.trim()

  let privateKey

  if (wifOrHex.length === 32) {
    privateKey = PrivateKeyWASM.fromHex(wifOrHex, network)
  } else {
    privateKey = PrivateKeyWASM.fromWIF(wifOrHex)
  }

  run(privateKey).catch((err) => console.error(`Error during processing private key (${wifOrHex.substring(0,8)}....): ${err.message ?? err.toString()}`))
});
