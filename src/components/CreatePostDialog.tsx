import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { publish } = useNostrPublish();
  const { user } = useCurrentUser();

  const categories = [
    { value: 'bitcoin', label: 'Bitcoin' },
    { value: 'free-speech', label: 'Free Speech' },
    { value: 'philosophy', label: 'Philosophy' },
    { value: 'technology', label: 'Technology' },
    { value: 'politics', label: 'Politics' },
    { value: 'general', label: 'General' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to create a post');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create post content with title
      const fullContent = `${title}\n\n${content}`;

      // Create tags for the post
      const tags = [
        ['t', category], // Topic tag
        ['client', 'orange-party'], // Client identification
      ];

      await publish({
        kind: 1,
        content: fullContent,
        tags,
      });

      // Reset form
      setTitle('');
      setContent('');
      setCategory('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the Orange Party community on Nostr
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="What's your post about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Topic</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
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
              {isSubmitting ? 'Publishing...' : 'Publish to Nostr'}
            </Button>
          </DialogFooter>
        </form>

        {!user && (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Please sign in with a Nostr extension to create posts
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}