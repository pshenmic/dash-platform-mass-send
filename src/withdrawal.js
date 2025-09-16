const { IdentityCreditWithdrawalTransitionWASM, IdentifierWASM, CoreScriptWASM } = require('pshenmic-dpp')
const { base58 } = require('@scure/base')

/**
 * Creates a withdrawal state transition
 *
 * @param amount {bigint}
 * @param identityId {IdentifierWASM}
 * @param identityNonce {bigint}
 * @param recipient {string=}
 * @param coreFeePerByte {number=}
 */
module.exports = function withdrawal(amount, identityId, identityNonce, recipient, coreFeePerByte) {
  const recipientPublicKeyHash = recipient ? base58.decode(recipient).slice(1,21) : undefined
  const coreScript = recipientPublicKeyHash ? CoreScriptWASM.newP2PKH(recipientPublicKeyHash) : undefined

  const transition = new IdentityCreditWithdrawalTransitionWASM(identityId.base58(), amount, coreFeePerByte ?? 2, 0, coreScript, identityNonce)

  console.log(`Processing a withdrawal request of ${amount} credits`)

  return transition.toStateTransition()
}
