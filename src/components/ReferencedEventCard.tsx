import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ExternalLink } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { getPrimalUrlForPubkey } from '@/lib/nostrUtils';

// Simplified Nostr identifier processing for referenced events (to prevent deep recursion)
function processNostrIdentifiersSimple(content: string, memberMap: Map<string, string>): string {
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
      return `❓ ${match}`;
    }
  });
}

interface ReferencedEventCardProps {
  event: NostrEvent;
  memberMap: Map<string, string>;
  depth?: number; // Track depth to prevent deep nesting in UI
}

export function ReferencedEventCard({ event, memberMap, depth = 1 }: ReferencedEventCardProps) {
  const authorName = memberMap.get(event.pubkey) || event.pubkey.substring(0, 8);
  const isMemberPost = memberMap.has(event.pubkey);

  // Format timestamp
  const formatTimeAgo = (timestamp: number) => {
    const now = new Date();
    const posted = new Date(timestamp * 1000);
    const diffMs = now.getTime() - posted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  // Get title and content based on event type
  let title = '';
  let content = event.content || '';

  // Process Nostr identifiers in content
  content = processNostrIdentifiersSimple(content, memberMap);

  if (event.kind === 30023) {
    // Long-form content
    const titleTag = event.tags?.find(tag => tag[0] === 'title');
    title = titleTag ? titleTag[1] : content.split('\n')[0] || 'Long-form Post';
    // Truncate content for preview
    const firstParagraph = content.split('\n\n')[0] || content.substring(0, 200);
    if (content.length > 200) content = firstParagraph + '...';
  } else {
    // Regular text note
    const firstLine = content.split('\n')[0] || content.substring(0, 100);
    title = firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
  }

  // Process Nostr identifiers in title as well
  title = processNostrIdentifiersSimple(title, memberMap);

  return (
    <Card className="border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                Referenced Event {depth > 1 && `(${depth} levels deep)`}
              </Badge>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 whitespace-pre-wrap break-words overflow-wrap-anywhere">
          {content}
        </p>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className={isMemberPost ? 'text-orange-600 dark:text-orange-400' : ''}>
              {(() => {
                const primalUrl = getPrimalUrlForPubkey(event.pubkey);
                const authorDisplay = `${isMemberPost ? '🍊' : '👤'} ${authorName}`;

                if (primalUrl) {
                  return (
                    <a
                      href={primalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      {authorDisplay}
                    </a>
                  );
                } else {
                  return authorDisplay;
                }
              })()}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatTimeAgo(event.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}