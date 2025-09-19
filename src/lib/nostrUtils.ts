import { nip19 } from 'nostr-tools';

/**
 * Generate a nprofile string from a hex pubkey
 * @param pubkey - The hex public key
 * @param relays - Optional array of relay URLs
 * @returns nprofile string
 */
export function generateNprofile(pubkey: string, relays?: string[]): string {
  return nip19.nprofileEncode({
    pubkey: pubkey,
    relays: relays || []
  });
}

/**
 * Generate Primal.net URL from hex pubkey
 * @param pubkey - The hex public key
 * @returns Primal.net profile URL
 */
export function generatePrimalUrl(pubkey: string): string {
  const nprofile = generateNprofile(pubkey);
  return `https://primal.net/p/${nprofile}`;
}

/**
 * Generate nprofile and Primal URLs for all users in nostr.json
 */
export const nostrUsers = {
  gary: {
    pubkey: 'd3d74124ddfb5bdc61b8f18d17c3335bbb4f8c71182a35ee27314a49a4eb7b1d',
    nprofile: generateNprofile('d3d74124ddfb5bdc61b8f18d17c3335bbb4f8c71182a35ee27314a49a4eb7b1d'),
    primalUrl: generatePrimalUrl('d3d74124ddfb5bdc61b8f18d17c3335bbb4f8c71182a35ee27314a49a4eb7b1d')
  },
  walker: {
    pubkey: '6542d8ac165eed065d28ec345ac5aa58503b20d0feb5ab20a26bb63d875f1ad9',
    nprofile: generateNprofile('6542d8ac165eed065d28ec345ac5aa58503b20d0feb5ab20a26bb63d875f1ad9'),
    primalUrl: generatePrimalUrl('6542d8ac165eed065d28ec345ac5aa58503b20d0feb5ab20a26bb63d875f1ad9')
  },
  revhodl: {
    pubkey: '4d023ce9dfd75a7f3075b8e8e084008be17a1f750c63b5de721e6ef883adc765',
    nprofile: generateNprofile('4d023ce9dfd75a7f3075b8e8e084008be17a1f750c63b5de721e6ef883adc765'),
    primalUrl: generatePrimalUrl('4d023ce9dfd75a7f3075b8e8e084008be17a1f750c63b5de721e6ef883adc765')
  },
  erik: {
    pubkey: 'bd9eb657c25b4f6cda68871ce26259d1f9bc62420487e3224905b674a710a45a',
    nprofile: generateNprofile('bd9eb657c25b4f6cda68871ce26259d1f9bc62420487e3224905b674a710a45a'),
    primalUrl: generatePrimalUrl('bd9eb657c25b4f6cda68871ce26259d1f9bc62420487e3224905b674a710a45a')
  },
  hodl: {
    pubkey: '1afe0c74e3d7784eba93a5e3fa554a6eeb01928d12739ae8ba4832786808e36d',
    nprofile: generateNprofile('1afe0c74e3d7784eba93a5e3fa554a6eeb01928d12739ae8ba4832786808e36d'),
    primalUrl: generatePrimalUrl('1afe0c74e3d7784eba93a5e3fa554a6eeb01928d12739ae8ba4832786808e36d')
  },
  opnState: {
    pubkey: '6685580e55b2f17aa639c94595083edfeb328e175af73587bb4e5af9b0396513',
    nprofile: generateNprofile('6685580e55b2f17aa639c94595083edfeb328e175af73587bb4e5af9b0396513'),
    primalUrl: generatePrimalUrl('6685580e55b2f17aa639c94595083edfeb328e175af73587bb4e5af9b0396513')
  },
  frank: {
    pubkey: '6cc4225f7970c56b9f4a1784a85ddbbde97599e365ba8c864a4d9105942b7222',
    nprofile: generateNprofile('6cc4225f7970c56b9f4a1784a85ddbbde97599e365ba8c864a4d9105942b7222'),
    primalUrl: generatePrimalUrl('6cc4225f7970c56b9f4a1784a85ddbbde97599e365ba8c864a4d9105942b7222')
  },
  theRage: {
    pubkey: '5743873fb6578066cf1140a9d31e368fb5ab84bf8ab4907f2fa50d0ead55c7c0',
    nprofile: generateNprofile('5743873fb6578066cf1140a9d31e368fb5ab84bf8ab4907f2fa50d0ead55c7c0'),
    primalUrl: generatePrimalUrl('5743873fb6578066cf1140a9d31e368fb5ab84bf8ab4907f2fa50d0ead55c7c0')
  },
  bitstein: {
    pubkey: '9579444852221038dcba34512257b66a1c6e5bdb4339b6794826d4024b3e4ce9',
    nprofile: generateNprofile('9579444852221038dcba34512257b66a1c6e5bdb4339b6794826d4024b3e4ce9'),
    primalUrl: generatePrimalUrl('9579444852221038dcba34512257b66a1c6e5bdb4339b6794826d4024b3e4ce9')
  },
  TheOrangeParty: {
    pubkey: '6542d8ac165eed065d28ec345ac5aa58503b20d0feb5ab20a26bb63d875f1ad9',
    nprofile: generateNprofile('6542d8ac165eed065d28ec345ac5aa58503b20d0feb5ab20a26bb63d875f1ad9'),
    primalUrl: generatePrimalUrl('6542d8ac165eed065d28ec345ac5aa58503b20d0feb5ab20a26bb63d875f1ad9')
  },
  guy: {
    pubkey: 'b9e76546ba06456ed301d9e52bc49fa48e70a6bf2282be7a1ae72947612023dc',
    nprofile: generateNprofile('b9e76546ba06456ed301d9e52bc49fa48e70a6bf2282be7a1ae72947612023dc'),
    primalUrl: generatePrimalUrl('b9e76546ba06456ed301d9e52bc49fa48e70a6bf2282be7a1ae72947612023dc')
  },
  bitcoinVeterans: {
    pubkey: '0596b8167de4d926ba1658286936eebd22532ea67ec12a90c0780ad66df1fc99',
    nprofile: generateNprofile('0596b8167de4d926ba1658286936eebd22532ea67ec12a90c0780ad66df1fc99'),
    primalUrl: generatePrimalUrl('0596b8167de4d926ba1658286936eebd22532ea67ec12a90c0780ad66df1fc99')
  }
};

/**
 * Get Primal URL for a pubkey
 * @param pubkey - The hex public key
 * @returns Primal.net profile URL or null if not found
 */
export function getPrimalUrlForPubkey(pubkey: string): string | null {
  const user = Object.values(nostrUsers).find(u => u.pubkey === pubkey);
  return user ? user.primalUrl : null;
}