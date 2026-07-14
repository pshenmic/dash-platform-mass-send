/**
 * Creates a withdrawal state transition
 *
 * @param sdk {DashPlatformSDK}
 * @param amount {bigint}
 * @param identityId {IdentifierLike}
 * @param identityNonce {bigint}
 * @param recipient {string=}
 * @param coreFeePerByte {number=}
 */
module.exports = function withdrawal(sdk, amount, identityId, identityNonce, recipient, coreFeePerByte) {
  const stateTransition = sdk.identities.createStateTransition('withdrawal', {
    amount,
    identityId,
    identityNonce,
    withdrawalAddress: recipient,
    pooling: "Never",
    coreFeePerByte
  })

  console.log(`Processing a withdrawal request of ${amount} credits`)

  return stateTransition
}
