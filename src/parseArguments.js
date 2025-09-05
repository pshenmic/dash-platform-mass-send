const fs = require('fs')
const path = require('path')
const { DEFAULT_WITHDRAWAL_FEE, DEFAULT_TRANSFER_FEE } = require('./constants')

const DEFAULT_FEES = {
  withdrawal: DEFAULT_WITHDRAWAL_FEE,
  transfer: DEFAULT_TRANSFER_FEE
}

module.exports = function (args) {
  const amount = args['--amount']
  const type = args['--type']
  const recipient = args['--recipient']
  const privateKeysPath = args['--private-keys-path']
  const network = args['--network']

  if (!type) {
    throw new Error('Type of mass send must be specified via --type flag')
  }

  if (type !== 'transfer' && type !== 'withdrawal') {
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

  if (type === 'transfer' && !recipient) {
    throw new Error('Specify the recipient of the funds via --recipient flag')
  }

  if (!privateKeysPath) {
    throw new Error('Please provide path to file with private keys via --private-keys-path flag')
  }

  const fee = args['--fee'] != null ? BigInt(args['--fee']) : BigInt(DEFAULT_FEES[type])

  const privateKeysFullPath = path.join(process.cwd(), privateKeysPath)

  if (!fs.existsSync(privateKeysFullPath)) {
    throw new Error(`Could not find private keys file at path ${privateKeysFullPath}`)
  }

  return {amount, type, privateKeysPath, recipient, network, privateKeysFullPath, fee}
}
