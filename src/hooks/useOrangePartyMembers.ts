import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { ORANGE_PARTY_ADMIN_PUBKEYS, ORANGE_PARTY_LIST_DTAG } from '@/lib/orangePartyAdmins';

export interface OrangePartyMember {
  name: string;
  pubkey: string;
}

/**
 * Fetches the Orange Party member list from Nostr.
 *
 * Each admin publishes a NIP-51 kind 30000 "Follow Set" event with d-tag
 * "orangeparty". This hook queries all admin pubkeys, then merges the union
 * of all `p` tags across their lists. The display name for each member comes
 * from the NIP-05 nostr.json fallback if no name is found in the list tags.
 *
 * Falls back to the static nostr.json if the Nostr query returns no events.
 */
export function useOrangePartyMembers() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['orange-party-members'],
    queryFn: async ({ signal }): Promise<OrangePartyMember[]> => {
      // Query all admin kind 30000 follow sets with d:"orangeparty"
      const events = await nostr.query(
        [{
          kinds: [30000],
          authors: ORANGE_PARTY_ADMIN_PUBKEYS,
          '#d': [ORANGE_PARTY_LIST_DTAG],
          limit: ORANGE_PARTY_ADMIN_PUBKEYS.length,
        }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(3000)]) }
      );

      if (events.length > 0) {
        // Merge all p tags from all admin lists, deduplicating by pubkey.
        // Later entries (newer events) win for the display name.
        const memberMap = new Map<string, string>();

        // Sort events oldest-first so newer events overwrite names
        const sorted = [...events].sort((a, b) => a.created_at - b.created_at);

        for (const event of sorted) {
          for (const tag of event.tags) {
            if (tag[0] === 'p' && tag[1]) {
              const pubkey = tag[1];
              // NIP-51 p tags can optionally carry a petname in tag[3]
              const petname = tag[3] ?? memberMap.get(pubkey) ?? pubkey.substring(0, 8);
              memberMap.set(pubkey, petname);
            }
          }
        }

        if (memberMap.size > 0) {
          return Array.from(memberMap.entries()).map(([pubkey, name]) => ({ pubkey, name }));
        }
      }

      // Fallback: load from static nostr.json
      const response = await fetch('/.well-known/nostr.json', { signal });
      if (!response.ok) throw new Error('Failed to load nostr.json fallback');
      const data = await response.json() as { names: Record<string, string> };
      return Object.entries(data.names).map(([name, pubkey]) => ({ name, pubkey }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/** Returns just the array of member pubkeys. */
export function useOrangePartyMemberPubkeys(): string[] {
  const { data } = useOrangePartyMembers();
  return data?.map((m) => m.pubkey) ?? [];
}
