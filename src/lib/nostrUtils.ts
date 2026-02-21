import { nip19 } from 'nostr-tools';

/**
 * Generate a nprofile string from a hex pubkey.
 */
export function generateNprofile(pubkey: string, relays?: string[]): string {
  return nip19.nprofileEncode({
    pubkey,
    relays: relays ?? [],
  });
}

/**
 * Generate a Primal.net profile URL from a hex pubkey.
 */
export function generatePrimalUrl(pubkey: string): string {
  return `https://primal.net/p/${generateNprofile(pubkey)}`;
}

/**
 * Get a Primal.net profile URL for any hex pubkey.
 */
export function getPrimalUrlForPubkey(pubkey: string): string {
  return generatePrimalUrl(pubkey);
}
