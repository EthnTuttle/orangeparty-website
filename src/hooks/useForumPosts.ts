import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

// Media URL detection utility
function extractMediaUrls(content: string): { images: string[]; videos: string[] } {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?$/i;
  const videoExtensions = /\.(mp4|webm|ogg|mov|avi|m4v)(\?[^\s]*)?$/i;
  const urlRegex = /(https?:\/\/[^\s]+)/gi;

  const urls = content.match(urlRegex) || [];
  const images: string[] = [];
  const videos: string[] = [];

  urls.forEach(url => {
    // Clean up URL (remove trailing punctuation)
    const cleanUrl = url.replace(/[.,;!?)]+$/, '');

    if (imageExtensions.test(cleanUrl)) {
      images.push(cleanUrl);
    } else if (videoExtensions.test(cleanUrl)) {
      videos.push(cleanUrl);
    }
  });

  return { images, videos };
}

// Extract nevent IDs from content
function extractNeventIds(content: string): string[] {
  const neventRegex = /(nevent1[0-9a-z]+)/gi;
  const matches = content.match(neventRegex) || [];
  const eventIds: string[] = [];

  for (const match of matches) {
    try {
      const decoded = nip19.decode(match);
      if (decoded.type === 'nevent') {
        eventIds.push(decoded.data.id);
      }
    } catch (error) {
      console.warn('Failed to decode nevent:', match, error);
    }
  }

  return [...new Set(eventIds)]; // Remove duplicates
}

// Nostr identifier processing utility
function processNostrIdentifiers(content: string, memberMap: Map<string, string>): string {
  // Match nevent, nprofile, npub, note identifiers
  const nostrRegex = /(nevent1[0-9a-z]+|nprofile1[0-9a-z]+|npub1[0-9a-z]+|note1[0-9a-z]+)/gi;

  return content.replace(nostrRegex, (match) => {
    try {
      const decoded = nip19.decode(match);

      switch (decoded.type) {
        case 'nevent':
          return `🔗 Event: ${decoded.data.id.substring(0, 8)}...`;

        case 'nprofile':
          const profilePubkey = decoded.data.pubkey;
          const profileName = memberMap.get(profilePubkey) || profilePubkey.substring(0, 8);
          const isMember = memberMap.has(profilePubkey);
          return `${isMember ? '🍊' : '👤'} ${profileName}`;

        case 'npub':
          const pubkeyName = memberMap.get(decoded.data) || decoded.data.substring(0, 8);
          const isOrangeMember = memberMap.has(decoded.data);
          return `${isOrangeMember ? '🍊' : '👤'} ${pubkeyName}`;

        case 'note':
          return `📝 Note: ${decoded.data.substring(0, 8)}...`;

        default:
          return match;
      }
    } catch (error) {
      // If decoding fails, return original match with indicator
      console.warn('Failed to decode Nostr identifier:', match, error);
      return `❓ ${match}`;
    }
  });
}

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
  mediaUrls?: {
    images: string[];
    videos: string[];
  };
  referencedEvents?: NostrEvent[];
}

export function useForumPosts(memberPubkeys: string[], includeNonTagged: boolean = false) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['forum-posts', memberPubkeys, includeNonTagged],
    queryFn: async () => {
      if (!nostr || memberPubkeys.length === 0) {
        return [];
      }

      const signal = AbortSignal.timeout(15000); // Increased timeout

      // Run tagged queries in parallel
      const taggedQueries = [
        // Query for text posts from all members with #orangeparty tag
        nostr.query([{
          kinds: [1],
          authors: memberPubkeys,
          '#t': ['orangeparty'],
          limit: 150,
        }], { signal }),

        // Query for long-form content from all members with #orangeparty tag
        nostr.query([{
          kinds: [30023],
          authors: memberPubkeys,
          '#t': ['orangeparty'],
          limit: 50,
        }], { signal }),
      ];

      // Add non-tagged queries if enabled
      if (includeNonTagged) {
        taggedQueries.push(
          nostr.query([{
            kinds: [1],
            authors: memberPubkeys,
            limit: 100,
          }], { signal }),

          nostr.query([{
            kinds: [30023],
            authors: memberPubkeys,
            limit: 30,
          }], { signal })
        );
      }

      const results = await Promise.all(taggedQueries);
      const [memberTextEvents, memberLongFormEvents] = results;
      const nonTaggedTextEvents = results[2] ?? [];
      const nonTaggedLongFormEvents = results[3] ?? [];

      // Get all member post IDs for reply queries (both tagged and non-tagged)
      const allMemberPosts = [...memberTextEvents, ...memberLongFormEvents, ...nonTaggedTextEvents, ...nonTaggedLongFormEvents];
      const memberPostIds = allMemberPosts.map(event => event.id);

      // Query for replies to Orange Party member posts (from anyone) - run separately to avoid timeout
      const replyEvents = memberPostIds.length > 0 ? await nostr.query([{
        kinds: [1, 1111], // Text notes + Comments
        '#e': memberPostIds,
        limit: 300,
      }], { signal }) : [];

      // Extract nevent IDs from top-level member posts (not replies)
      const topLevelMemberPosts = [...memberTextEvents, ...memberLongFormEvents, ...nonTaggedTextEvents, ...nonTaggedLongFormEvents];
      const neventIds = new Set<string>();

      topLevelMemberPosts.forEach(event => {
        const eventIds = extractNeventIds(event.content);
        eventIds.forEach(id => neventIds.add(id));
      });

      // Query for referenced events with depth limit to prevent inception
      const referencedEvents: NostrEvent[] = [];
      let currentNeventIds = neventIds;
      let depth = 0;
      const maxDepth = 3;
      const allFetchedIds = new Set<string>();

      while (currentNeventIds.size > 0 && depth < maxDepth) {
        // Filter out already fetched IDs
        const newIds = Array.from(currentNeventIds).filter(id => !allFetchedIds.has(id));
        if (newIds.length === 0) break;

        // Fetch events at current depth
        const depthEvents = await nostr.query([{
          kinds: [1, 30023], // Text notes and long-form content
          ids: newIds,
          limit: 50,
        }], { signal });

        referencedEvents.push(...depthEvents);

        // Track fetched IDs
        depthEvents.forEach(event => allFetchedIds.add(event.id));

        // Extract nevents from newly fetched events for next depth level
        const nextNeventIds = new Set<string>();
        depthEvents.forEach(event => {
          const eventIds = extractNeventIds(event.content);
          eventIds.forEach(id => {
            if (!allFetchedIds.has(id)) {
              nextNeventIds.add(id);
            }
          });
        });

        currentNeventIds = nextNeventIds;
        depth++;
      }

      console.log('Referenced events found:', referencedEvents.length, 'from', neventIds.size, 'initial nevent references, depth:', depth);

      // Combine all events and deduplicate
      const allEvents = [...memberTextEvents, ...memberLongFormEvents, ...nonTaggedTextEvents, ...nonTaggedLongFormEvents, ...replyEvents, ...referencedEvents];
      const uniqueEvents = allEvents.filter((event, index, self) =>
        index === self.findIndex(e => e.id === event.id)
      );

      console.log('Query results:', {
        memberTextEvents: memberTextEvents.length,
        memberLongFormEvents: memberLongFormEvents.length,
        nonTaggedTextEvents: nonTaggedTextEvents.length,
        nonTaggedLongFormEvents: nonTaggedLongFormEvents.length,
        replyEvents: replyEvents.length,
        totalUnique: uniqueEvents.length
      });

      return uniqueEvents;
    },
    enabled: !!nostr && memberPubkeys.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useProcessedForumPosts(
  memberPubkeys: string[],
  members?: Array<{name: string, pubkey: string}>,
  options?: { enabled?: boolean; includeNonTagged?: boolean }
) {
  const { data: events, isLoading: eventsLoading } = useForumPosts(memberPubkeys, options?.includeNonTagged || false);
  const [processedPosts, setProcessedPosts] = useState<ForumPost[]>([]);

  // Process posts when data changes
  useEffect(() => {
    if (!events || !members || events.length === 0) {
      setProcessedPosts([]);
      return;
    }

    console.log('Processing events:', events.length, 'events');
    console.log('Member pubkeys:', memberPubkeys);
    console.log('Events by author:', events.reduce((acc, event) => {
      acc[event.pubkey] = (acc[event.pubkey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));

    const memberMap = new Map(members.map(m => [m.pubkey, m.name]));

      // Convert events to posts
      const allPosts: ForumPost[] = events.map((event: NostrEvent) => {
        let content = event.content || '';
        let title = '';

        // Process Nostr identifiers in content
        content = processNostrIdentifiers(content, memberMap);

        // Handle different event kinds
        if (event.kind === 30023) {
          // Long-form content - look for title in tags
          const titleTag = event.tags?.find(tag => tag[0] === 'title');
          title = titleTag ? titleTag[1] : content.split('\n')[0] || 'Long-form Post';
          // For long-form, use first paragraph as preview
          const firstParagraph = content.split('\n\n')[0] || content.substring(0, 200);
          if (content.length > 200) content = firstParagraph + '...';
        } else {
          // Regular text note
          const firstLine = content.split('\n')[0] || content.substring(0, 100);
          title = firstLine.length > 80 ? firstLine.substring(0, 80) + '...' : firstLine;
        }

        // Process Nostr identifiers in title as well
        title = processNostrIdentifiers(title, memberMap);

        // Check if this is a reply by looking for 'e' tags
        const replyTags = event.tags?.filter(tag => tag[0] === 'e') || [];
        const isReply = replyTags.length > 0;
        const parentId = isReply ? replyTags[0][1] : undefined;


        // Check if this is a member post
        const isMemberPost = memberPubkeys.includes(event.pubkey);

        // Extract media URLs for top-level posts only (not replies)
        const mediaUrls = !isReply ? extractMediaUrls(content) : undefined;

        // Extract referenced events for top-level posts only (not replies)
        let referencedEvents: NostrEvent[] | undefined = undefined;
        if (!isReply) {
          const neventIds = extractNeventIds(event.content);
          if (neventIds.length > 0) {
            referencedEvents = events.filter(e => neventIds.includes(e.id));
          }
        }

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
          title: isReply ? `Re: ${title.substring(0, 60)}...` : title,
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
          mediaUrls,
          referencedEvents,
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


      setProcessedPosts(sortedPosts);
    }, [events, members, memberPubkeys]);

  return {
    data: processedPosts,
    isLoading: eventsLoading,
  };
}