const { IdentityCreditWithdrawalTransitionWASM, IdentifierWASM } = require('pshenmic-dpp')

/**
 * Creates a withdraw state transition
 *
 * @param amount {bigint}
 * @param identityId {IdentifierWASM}
 * @param recipient {IdentifierWASM}
 * @param identityNonce {bigint}
 */
module.exports = function transfer(amount, identityId, recipient, identityNonce) {
  const transition = new IdentityCreditWithdrawalTransitionWASM(amount, identityId, recipient, identityNonce)

  console.log(`Identity: ${identity.id.base58()}, Balance: ${balance} credits, withdrawing to ${recipient}, Fee ${fee} credits, Amount ${amountToSend}`)

  return transition.toStateTransition()
}
