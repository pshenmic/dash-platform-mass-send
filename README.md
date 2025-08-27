# Dash Platform Mass Send Tool

This script allow you to massively send or withdraw credits from your identities

Prepare a list of transfer private keys in a textfile, and the script will process a mass send for you.

## Prerequisites

1) A list of private keys of your identities in a .txt file (each per row, and it must be TRANSFER / CRITICAL, or owner private key) 
2) Node.JS LTS (https://nodejs.org/en/download)

## How to use

### Prepare your folder:

1) `git clone https://github.com/pshenmic/dash-platform-mass-send`
2) cd `dash-platform-mass-send`
3) npm install
4) create a txt file `private_keys.txt` with private keys from your identities

### Execute script

#### Withdraw all credits to Dash Core (L1) address:

`node index.js --private-keys-path private_keys.txt --network testnet --recipient yMVL4WGPLyskTEkhF8BuYHF4R7B8Bxne2N --type withdraw`

#### Withdraw specific amount of credits to Dash Core (L1) address:

`node index.js --private-keys-path private_keys.txt --network testnet --recipient yMVL4WGPLyskTEkhF8BuYHF4R7B8Bxne2N --type withdraw --amount 10000000000`

#### Transfer all credits to another Platform Identity:
`node index.js --private-keys-path private_keys.txt --network testnet --recipient CKKYnVeKoxCbvuEhiT6MDoQaRyXgDECwtxoKL5cqucZE --type transfer`

#### Transfer specific amount of credits to another Platform Identity:
`node index.js --private-keys-path private_keys.txt --network testnet --recipient HT3pUBM1Uv2mKgdPEN1gxa7A4PdsvNY89aJbdSKQb5wR --type transfer --amount 10000000`
