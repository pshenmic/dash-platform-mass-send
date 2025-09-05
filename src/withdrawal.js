const { IdentityCreditWithdrawalTransitionWASM, IdentifierWASM, CoreScriptWASM } = require('pshenmic-dpp')

/**
 * Creates a withdrawal state transition
 *
 * @param amount {bigint}
 * @param identityId {IdentifierWASM}
 * @param identityNonce {bigint}
 * @param outputScript {CoreScriptWASM=}
 * @param coreFeePerByte {number=}
 */
module.exports = function withdrawal(amount, identityId, identityNonce, outputScript, coreFeePerByte) {
  const transition = new IdentityCreditWithdrawalTransitionWASM(identityId.base58(), amount, coreFeePerByte ?? 2, 0, outputScript, identityNonce)

  console.log(`Processing a withdrawal request of ${amount} credits`)

  return transition.toStateTransition()
}
