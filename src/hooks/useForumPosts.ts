import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorName: string;
  category: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timestamp: string;
  isStickied?: boolean;
  replies?: ForumPost[];
  isReply?: boolean;
  parentId?: string;
  isMemberPost: boolean;
  event: NostrEvent;
}

export function useForumPosts(memberPubkeys: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['forum-posts', memberPubkeys],
    queryFn: async () => {
      if (!nostr || memberPubkeys.length === 0) {
        console.log('No nostr or no member pubkeys:', { nostr: !!nostr, memberPubkeys });
        return [];
      }

      console.log('Querying for member pubkeys:', memberPubkeys);
      const signal = AbortSignal.timeout(10000);
      
      // Query for posts from members
      const memberEvents = await nostr.query([{
        kinds: [1], // Text notes
        authors: memberPubkeys,
        limit: 100,
      }], { signal });
      
      console.log('Member events found:', memberEvents.length);

      // Query for replies to member posts (from anyone)
      const memberPostIds = memberEvents.map(event => event.id);
      const replyEvents = memberPostIds.length > 0 ? await nostr.query([{
        kinds: [1],
        '#e': memberPostIds,
        limit: 200,
      }], { signal }) : [];

      // Query for posts that mention members (to catch broader conversations)
      const mentionEvents = await nostr.query([{
        kinds: [1],
        '#p': memberPubkeys,
        limit: 50,
      }], { signal });

      // Combine all events and deduplicate
      const allEvents = [...memberEvents, ...replyEvents, ...mentionEvents];
      const uniqueEvents = allEvents.filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      );

      return uniqueEvents;
    },
    enabled: !!nostr && memberPubkeys.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProcessedForumPosts(
  memberPubkeys: string[], 
  members?: Array<{name: string, pubkey: string}>,
  options?: { enabled?: boolean }
) {
  const { data: events, isLoading: eventsLoading } = useForumPosts(memberPubkeys);
  const [processedPosts, setProcessedPosts] = useState<ForumPost[]>([]);
  
  // Memoize memberPubkeys to prevent infinite loops
  const stableMemberPubkeys = useMemo(() => memberPubkeys, [memberPubkeys.join(',')]);

  // Process posts when data changes
  useEffect(() => {
    console.log('useEffect triggered with:', { 
      events: !!events, 
      members: !!members, 
      eventsLength: events?.length,
      membersLength: members?.length,
      memberPubkeysLength: stableMemberPubkeys.length
    });
    
    if (!events || !members || events.length === 0) {
      console.log('Missing data for processing:', { events: !!events, members: !!members, eventsLength: events?.length });
      setProcessedPosts([]);
      return;
    }

    console.log('Starting post processing with:', { 
      eventsCount: events.length, 
      membersCount: members.length,
      memberPubkeys: stableMemberPubkeys.length 
    });

    const memberMap = new Map(members.map(m => [m.pubkey, m.name]));

      // Convert events to posts
      const allPosts: ForumPost[] = events.map((event: NostrEvent) => {
        const content = event.content || '';
        const firstLine = content.split('\n')[0] || content.substring(0, 100);

        // Check if this is a reply by looking for 'e' tags
        const replyTags = event.tags?.filter(tag => tag[0] === 'e') || [];
        const isReply = replyTags.length > 0;
        const parentId = isReply ? replyTags[0][1] : undefined;

        // Check if this is a member post
        const isMemberPost = stableMemberPubkeys.includes(event.pubkey);

        // Categorize based on topic tags first, then content keywords
        let category = 'General';
        const topicTag = event.tags?.find(tag => tag[0] === 't')?.[1];
        if (topicTag) {
          category = {
            'bitcoin': 'Bitcoin',
            'free-speech': 'Free Speech',
            'philosophy': 'Philosophy',
            'technology': 'Technology',
            'politics': 'Politics',
            'general': 'General',
          }[topicTag] || 'General';
        } else {
          // Fall back to content-based categorization
          const lowerContent = content.toLowerCase();
          if (lowerContent.includes('bitcoin') || lowerContent.includes('btc') || lowerContent.includes('sats')) {
            category = 'Bitcoin';
          } else if (lowerContent.includes('free speech') || lowerContent.includes('first amendment') || lowerContent.includes('censorship')) {
            category = 'Free Speech';
          } else if (lowerContent.includes('technology') || lowerContent.includes('tech') || lowerContent.includes('innovation')) {
            category = 'Technology';
          } else if (lowerContent.includes('politics') || lowerContent.includes('government') || lowerContent.includes('political')) {
            category = 'Politics';
          } else if (lowerContent.includes('philosophy') || lowerContent.includes('nihilism') || lowerContent.includes('meaning')) {
            category = 'Philosophy';
          }
        }

        return {
          id: event.id,
          title: isReply ? `Re: ${firstLine.substring(0, 60)}...` : (firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine),
          content: content,
          author: event.pubkey,
          authorName: memberMap.get(event.pubkey) || event.pubkey.substring(0, 8),
          category,
          upvotes: Math.floor(Math.random() * 200) + 10, // Random for demo
          downvotes: Math.floor(Math.random() * 20),
          comments: 0, // Will be calculated
          timestamp: new Date(event.created_at * 1000).toISOString(),
          isStickied: false,
          isReply,
          parentId,
          replies: [],
          isMemberPost,
          event,
        };
      });

      // Build threading structure
      const topLevelPosts: ForumPost[] = [];
      const postMap = new Map<string, ForumPost>();

      // First pass: add all posts to map
      allPosts.forEach(post => {
        postMap.set(post.id, post);
      });

      // Second pass: build threading
      allPosts.forEach(post => {
        if (post.isReply && post.parentId) {
          const parent = postMap.get(post.parentId);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(post);
            parent.comments = (parent.replies?.length || 0);
          }
        } else {
          topLevelPosts.push(post);
        }
      });

      // Sort top-level posts by date, sort replies within each thread
      topLevelPosts.forEach(post => {
        if (post.replies) {
          post.replies.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
      });

      // Sort by member posts first, then by date
      const sortedPosts = topLevelPosts.sort((a, b) => {
        if (a.isMemberPost && !b.isMemberPost) return -1;
        if (!a.isMemberPost && b.isMemberPost) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      
      console.log('Final processed posts:', {
        total: sortedPosts.length,
        memberPosts: sortedPosts.filter(p => p.isMemberPost).length,
        authors: [...new Set(sortedPosts.map(p => p.authorName))],
        topLevelPosts: topLevelPosts.length
      });
      
      setProcessedPosts(sortedPosts);
    }, [events, members, stableMemberPubkeys]);
  
  return {
    data: processedPosts,
    isLoading: eventsLoading,
  };
}