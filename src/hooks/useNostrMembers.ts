import { useQuery } from '@tanstack/react-query';

interface NostrMember {
  name: string;
  pubkey: string;
}

interface NostrJson {
  names: Record<string, string>;
}

export function useNostrMembers() {
  return useQuery({
    queryKey: ['nostr-members'],
    queryFn: async (): Promise<NostrMember[]> => {
      const response = await fetch('/.well-known/nostr.json');
      if (!response.ok) {
        throw new Error('Failed to load nostr.json');
      }
      const data: NostrJson = await response.json();
      
      // Convert the names object to an array of members
      return Object.entries(data.names).map(([name, pubkey]) => ({
        name,
        pubkey
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useNostrMemberPubkeys() {
  const { data: members } = useNostrMembers();
  return members?.map(member => member.pubkey) || [];
}

export function getMemberName(pubkey: string, members?: NostrMember[]): string {
  if (!members) return pubkey.substring(0, 8);
  const member = members.find(m => m.pubkey === pubkey);
  return member?.name || pubkey.substring(0, 8);
}
