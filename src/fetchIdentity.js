/**
 * Fetches an identity by public key hash
 *
 * @param sdk {DashPlatformSDK}
 * @param publicKeyHash {string}
 * @param proTxHash {string=}
 */
module.exports = async function fetchIdentity(sdk, publicKeyHash, proTxHash) {
  let masternodeIdentity

  if(proTxHash != null) {
    masternodeIdentity = await sdk.identities.getIdentityByIdentifier(sdk.utils.bytesToBase58(sdk.utils.hexToBytes(proTxHash)))
  }

  if (masternodeIdentity) {
    return masternodeIdentity
  }

  let uniqueIdentity

  try {
    uniqueIdentity = await sdk.identities.getIdentityByPublicKeyHash(publicKeyHash)
  } catch (e) {
  }

  if (uniqueIdentity) {
    return uniqueIdentity
  }

  let nonUniqueIdentity

  try {
    nonUniqueIdentity = await sdk.identities.getIdentityByNonUniquePublicKeyHash(publicKeyHash)
  } catch (e) {
  }

  if (nonUniqueIdentity) {
    return nonUniqueIdentity
  }

  return null
}
