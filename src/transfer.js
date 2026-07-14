/**
 * Creates a transfer state transition
 *
 * @param sdk {DashPlatformSDK}
 * @param amount {bigint}
 * @param identityId {IdentifierWASM}
 * @param recipient {IdentifierWASM}
 * @param identityNonce {bigint}
 */
module.exports = function transfer(sdk, amount, identityId, recipient, identityNonce) {
  const stateTransition = sdk.identities.createStateTransition('creditTransfer', {
    amount,
    identityId,
    recipientId: recipient,
    identityNonce
  })

  console.log(`Performing transfer to: ${identityId.base58()}, Amount: ${amount} credits, transfer to ${recipient}, identityNonce: ${identityNonce}`)

  return stateTransition
}
