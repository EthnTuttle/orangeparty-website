/**
 * Orange Party admin pubkeys.
 *
 * These are the Nostr pubkeys whose NIP-51 kind 30000 "Follow Set" events
 * (with d-tag "orangeparty") are trusted as sources of the member list.
 *
 * Any admin can publish or update their own list from any Nostr client that
 * supports NIP-51 follow sets. The site merges the union of all their lists.
 *
 * To add or remove an admin, update this file and redeploy.
 * To add or remove members, no code change is needed — just publish an
 * updated kind 30000 event with d:"orangeparty" from one of these keys.
 */
export const ORANGE_PARTY_ADMIN_PUBKEYS: string[] = [
  'd3d74124ddfb5bdc61b8f18d17c3335bbb4f8c71182a35ee27314a49a4eb7b1d', // average_bitcoiner
  '6542d8ac165eed065d28ec345ac5aa58503b20d0feb5ab20a26bb63d875f1ad9', // walker / TheOrangeParty
  '4d023ce9dfd75a7f3075b8e8e084008be17a1f750c63b5de721e6ef883adc765', // revhodl
  'bd9eb657c25b4f6cda68871ce26259d1f9bc62420487e3224905b674a710a45a', // erik
  '1afe0c74e3d7784eba93a5e3fa554a6eeb01928d12739ae8ba4832786808e36d', // hodl
  '6685580e55b2f17aa639c94595083edfeb328e175af73587bb4e5af9b0396513', // opnState
  '6cc4225f7970c56b9f4a1784a85ddbbde97599e365ba8c864a4d9105942b7222', // frank
  '5743873fb6578066cf1140a9d31e368fb5ab84bf8ab4907f2fa50d0ead55c7c0', // theRage
  '9579444852221038dcba34512257b66a1c6e5bdb4339b6794826d4024b3e4ce9', // bitstein
  'b9e76546ba06456ed301d9e52bc49fa48e70a6bf2282be7a1ae72947612023dc', // guy
  '0596b8167de4d926ba1658286936eebd22532ea67ec12a90c0780ad66df1fc99', // bitcoinVeterans
  'ca285fbf6d128adf406c416c33a3dafc0242e52999154006aaa43eaddf004ef2', // gabe
];

/** The NIP-51 d-tag identifier for the Orange Party follow set. */
export const ORANGE_PARTY_LIST_DTAG = 'orangeparty';

/** Returns true if the given pubkey is a configured admin. */
export function isOrangePartyAdmin(pubkey: string): boolean {
  return ORANGE_PARTY_ADMIN_PUBKEYS.includes(pubkey);
}
