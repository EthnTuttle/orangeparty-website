import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

interface ReactionCounts {
  upvotes: number;
  downvotes: number;
  reactions: NostrEvent[];
}

export function useReactions(eventId: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<ReactionCounts>({
    queryKey: ['reactions', eventId],
    queryFn: async () => {
      if (!eventId) {
        return { upvotes: 0, downvotes: 0, reactions: [] };
      }

      const signal = AbortSignal.timeout(5000);

      // Query for kind 7 (reaction) events that reference this event
      const reactions = await nostr.query([{
        kinds: [7], // Reaction events
        '#e': [eventId], // Events that reference our target event
        limit: 100, // Reasonable limit for reactions
      }], { signal });

      // Count upvotes and downvotes
      let upvotes = 0;
      let downvotes = 0;

      // Only count the latest reaction from each user to prevent spam
      const latestReactionsByUser = new Map<string, NostrEvent>();

      for (const reaction of reactions) {
        const existing = latestReactionsByUser.get(reaction.pubkey);
        if (!existing || reaction.created_at > existing.created_at) {
          latestReactionsByUser.set(reaction.pubkey, reaction);
        }
      }

      // Count the latest reactions
      for (const reaction of latestReactionsByUser.values()) {
        const content = reaction.content.trim();

        if (content === '+' || content === '') {
          upvotes++;
        } else if (content === '-') {
          downvotes++;
        }
        // Ignore emoji reactions for vote counting
      }

      return {
        upvotes,
        downvotes,
        reactions: Array.from(latestReactionsByUser.values()),
      };
    },
    enabled: !!eventId && !!nostr,
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refetch every minute for live updates
  });
}