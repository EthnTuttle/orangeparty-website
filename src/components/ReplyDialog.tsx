import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';

interface ReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentEventId: string;
  parentAuthor: string;
}

export function ReplyDialog({ open, onOpenChange, parentEventId, parentAuthor }: ReplyDialogProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { publish } = useNostrPublish();
  const { user, picture, name } = useCurrentUser();

  const displayName = name || (user?.pubkey ? genUserName(user.pubkey) : 'Anonymous');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to reply');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create reply with proper tags
      const tags = [
        ['e', parentEventId, '', 'reply'], // Event reference for reply
        ['client', 'orange-party'], // Client identification
      ];

      await publish({
        kind: 1,
        content,
        tags,
      });

      // Reset form
      setContent('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to publish reply:', error);
      alert('Failed to publish reply. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to u/{parentAuthor}</DialogTitle>
          <DialogDescription>
            Your reply will be published to Nostr as a threaded response
          </DialogDescription>
          {user && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={picture} alt={displayName} />
                <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Replying as {displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.pubkey.substring(0, 16)}...
                </p>
              </div>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Reply</Label>
            <Textarea
              id="content"
              placeholder="Write your reply..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !user}>
              {isSubmitting ? 'Publishing...' : 'Reply'}
            </Button>
          </DialogFooter>
        </form>

        {!user && (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Please sign in with a Nostr extension to reply
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}