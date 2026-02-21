import { useOrangePartyMembers, useOrangePartyMemberPubkeys } from '@/hooks/useOrangePartyMembers';

export interface NostrMember {
  name: string;
  pubkey: string;
}

/**
 * Returns the Orange Party member list.
 * Data is sourced from NIP-51 kind 30000 follow sets published by admin
 * pubkeys, with a fallback to the static nostr.json file.
 */
export function useNostrMembers() {
  return useOrangePartyMembers();
}

/** Returns just the array of member pubkeys. */
export function useNostrMemberPubkeys(): string[] {
  return useOrangePartyMemberPubkeys();
}

export function getMemberName(pubkey: string, members?: NostrMember[]): string {
  if (!members) return pubkey.substring(0, 8);
  const member = members.find((m) => m.pubkey === pubkey);
  return member?.name ?? pubkey.substring(0, 8);
}
