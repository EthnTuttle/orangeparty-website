import { useSeoMeta } from '@unhead/react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { MessageSquare, Share, Calendar, User, Search, Plus, Crown, ChevronDown, ChevronRight, MoreVertical, Eye, ExternalLink } from 'lucide-react';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { ReplyDialog } from '@/components/ReplyDialog';
import { ReactionCountDisplay } from '@/components/ReactionCountDisplay';
import { ReferencedEventCard } from '@/components/ReferencedEventCard';
import { LoginArea } from '@/components/auth/LoginArea';
import { useProcessedForumPosts, type ForumPost } from '@/hooks/useForumPosts';
import { useNostrMembers } from '@/hooks/useNostrMembers';
import { getPrimalUrlForPubkey } from '@/lib/nostrUtils';
import { useMemo } from 'react';

const Forum = () => {
  // State declarations first
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>(['all']);
  const [includeNonTagged, setIncludeNonTagged] = useState(false);

  // Load Orange Party members and forum posts
  const { data: members, isLoading: membersLoading } = useNostrMembers();
  const memberPubkeys = useMemo(() => members?.map(m => m.pubkey) || [], [members]);
  const memberMap = useMemo(() => new Map(members?.map(m => [m.pubkey, m.name]) || []), [members]);
  const { data: posts = [], isLoading } = useProcessedForumPosts(
    memberPubkeys,
    members,
    { enabled: !!members && memberPubkeys.length > 0, includeNonTagged }
  );
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [replyDialog, setReplyDialog] = useState<{ open: boolean; parentEventId: string; parentAuthor: string }>({
    open: false,
    parentEventId: '',
    parentAuthor: '',
  });
  const [rawEventDialog, setRawEventDialog] = useState<{ open: boolean; event: any }>({
    open: false,
    event: null,
  });
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code when raw event dialog opens
  useEffect(() => {
    if (rawEventDialog.open && rawEventDialog.event && qrCanvasRef.current) {
      const eventId = rawEventDialog.event.id;
      if (eventId) {
        console.log('Generating QR code for event ID:', eventId);
        QRCode.toCanvas(qrCanvasRef.current, eventId, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        }).then(() => {
          console.log('QR code generated successfully');
        }).catch((error) => {
          console.error('Failed to generate QR code:', error);
        });
      }
    }
  }, [rawEventDialog.open, rawEventDialog.event]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());

    // For user filtering with multi-select
    let matchesUser = true;
    if (!selectedUsers.includes('all') && selectedUsers.length > 0) {
      // Check if the authorName matches any of the selected users
      matchesUser = selectedUsers.includes(post.authorName);
    }

    return matchesSearch && matchesUser;
  });

  useSeoMeta({
    title: 'Orange Party Forum - Open Discussion',
    description: 'Join the discussion on Bitcoin, free speech, technology, and building a better future through peaceful means.',
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const posted = new Date(timestamp);
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

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const PostCard = ({ post }: { post: ForumPost }) => {
    const isExpanded = expandedPosts.has(post.id);
    const hasReplies = post.replies && post.replies.length > 0;

    return (
      <div className="space-y-2">
        <Card className={`border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow overflow-hidden ${post.isStickied ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.isStickied && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                      Pinned
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer break-words flex-1">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {hasReplies && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePostExpansion(post.id)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setRawEventDialog({ open: true, event: post.event })}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Raw Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              <CardDescription className="flex items-center gap-4 text-sm mt-2">
                <span className="flex items-center gap-1">
                  {post.isMemberPost ? (
                    <Crown className="h-3 w-3 text-orange-500" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span className="break-all">
                    {(() => {
                      const primalUrl = getPrimalUrlForPubkey(post.author);
                      const authorDisplay = `${post.isMemberPost ? '🍊' : '👤'}${post.authorName}`;

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
                    {post.isMemberPost && <span className="text-orange-600 dark:text-orange-400 text-xs ml-1">(Member)</span>}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatTimeAgo(post.timestamp)}
                </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {post.content}
            </p>

            {/* Media Display for Top-Level Posts */}
            {post.mediaUrls && (post.mediaUrls.images.length > 0 || post.mediaUrls.videos.length > 0) && (
              <div className="mb-4 space-y-3">
                {/* Images */}
                {post.mediaUrls.images.length > 0 && (
                  <div className="grid gap-2 max-w-full">
                    {post.mediaUrls.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Image ${index + 1}`}
                          className="max-w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          loading="lazy"
                          onClick={() => window.open(imageUrl, '_blank')}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Videos */}
                {post.mediaUrls.videos.length > 0 && (
                  <div className="space-y-2">
                    {post.mediaUrls.videos.map((videoUrl, index) => (
                      <div key={index} className="relative">
                        <video
                          src={videoUrl}
                          controls
                          className="max-w-full h-auto rounded-lg shadow-sm"
                          preload="metadata"
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement;
                            target.style.display = 'none';
                          }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Referenced Events Display for Top-Level Posts */}
            {post.referencedEvents && post.referencedEvents.length > 0 && (
              <div className="mb-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Referenced Events:
                </h4>
                {post.referencedEvents.map((referencedEvent) => (
                  <ReferencedEventCard
                    key={referencedEvent.id}
                    event={referencedEvent}
                    memberMap={memberMap}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ReactionCountDisplay eventId={post.id} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={() => setReplyDialog({ open: true, parentEventId: post.id, parentAuthor: post.author })}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <span className="text-sm text-gray-500">
                  {post.comments} {post.comments === 1 ? 'reply' : 'replies'}
                </span>
                <Button variant="ghost" size="sm" className="h-8">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Threaded Replies - Only show when expanded */}
        {hasReplies && isExpanded && (
          <div className="ml-6 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            {post.replies?.map((reply) => (
              <Card key={reply.id} className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {reply.isMemberPost ? (
                        <Crown className="h-3 w-3 text-orange-500" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span className="text-sm font-medium break-all">
                        {(() => {
                          const primalUrl = getPrimalUrlForPubkey(reply.author);
                          const authorDisplay = `${reply.isMemberPost ? '🍊' : '👤'}${reply.authorName}`;

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
                        {reply.isMemberPost && <span className="text-orange-600 dark:text-orange-400 text-xs ml-1">(Member)</span>}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(reply.timestamp)}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setRawEventDialog({ open: true, event: reply.event })}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Raw Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {reply.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ReactionCountDisplay eventId={reply.id} size="sm" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setReplyDialog({ open: true, parentEventId: post.id, parentAuthor: reply.author })}
                    >
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🍊</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Orange Party</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Community Forum</p>
            </div>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/politician-monitor"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm hidden sm:block"
            >
              Political Monitor
            </Link>
            <Link
              to="/resources"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm hidden sm:block"
            >
              Resources
            </Link>

            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setShowCreatePost(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">New Post</span>
            </Button>

            <div className="border-l border-gray-300 dark:border-gray-600 h-8"></div>

            <LoginArea />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">About Orange Party</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Real discussions from Orange Party members on Nostr. Exploring Bitcoin, free speech, and peaceful solutions to societal challenges.
                </p>
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-2 font-medium">Current Members:</p>
                  <div className="flex flex-wrap gap-1">
                    {members?.map((member) => (
                      <Badge key={member.pubkey} variant="outline" className="text-xs">
                        🍊 {member.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge variant="secondary" className="mb-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Live Nostr Feed
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Not an Official Political Party
                </Badge>
                <div className="mt-3">
                  <Link to="/members" className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline underline-offset-2">
                    Manage member list →
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Post Options</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeNonTagged"
                    checked={includeNonTagged}
                    onCheckedChange={(checked) => setIncludeNonTagged(checked === true)}
                  />
                  <Label htmlFor="includeNonTagged" className="text-sm">
                    Include non-tagged posts
                  </Label>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Show all posts from Orange Party members, not just #orangeparty tagged ones
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Filter by Member</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="all-members"
                      checked={selectedUsers.includes('all')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers(['all']);
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                    <Label htmlFor="all-members" className="text-sm font-medium">
                      All Members
                    </Label>
                  </div>
                  {members?.map((member) => (
                    <div key={member.pubkey} className="flex items-center space-x-2">
                      <Checkbox
                        id={member.name}
                        checked={selectedUsers.includes(member.name) || selectedUsers.includes('all')}
                        disabled={selectedUsers.includes('all')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(prev => [...prev.filter(u => u !== 'all'), member.name]);
                          } else {
                            setSelectedUsers(prev => prev.filter(u => u !== member.name));
                          }
                        }}
                      />
                      <Label htmlFor={member.name} className="text-sm">
                        🍊 {member.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">Forum Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="text-gray-600 dark:text-gray-300">
                  <p>• Be respectful and civil</p>
                  <p>• No violence or threats</p>
                  <p>• Engage in good faith</p>
                  <p>• No spam or self-promotion</p>
                  <p>• Stay on topic</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>


            {/* Posts */}
            <div className="space-y-4">
              {isLoading || membersLoading ? (
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="text-center py-12">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">
                      Loading Orange Party discussions from Nostr...
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}

                  {filteredPosts.length === 0 && (
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardContent className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                          No posts found matching your criteria.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-orange-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Vibe Coded with 🧡 for the Orange Party community
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <a
              href="https://github.com/EthnTuttle/orangeparty-website/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Suggest Changes or Request to be Added
            </a>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
      />

      <ReplyDialog
        open={replyDialog.open}
        onOpenChange={(open) => setReplyDialog(prev => ({ ...prev, open }))}
        parentEventId={replyDialog.parentEventId}
        parentAuthor={replyDialog.parentAuthor}
      />

      {/* Raw Event Dialog */}
      <Dialog open={rawEventDialog.open} onOpenChange={(open) => setRawEventDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Raw Nostr Event</DialogTitle>
            <DialogDescription>
              Raw JSON data for this Nostr event
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="flex gap-4 h-full">
              {/* QR Code Section */}
              <div className="flex-shrink-0 bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="text-center mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Event ID</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Scan to copy</p>
                </div>
                <div className="flex justify-center">
                  <canvas
                    ref={qrCanvasRef}
                    className="border border-gray-200 dark:border-gray-600 rounded bg-white"
                    style={{ display: 'block' }}
                  />
                </div>
                {rawEventDialog.event?.id && (
                  <div className="mt-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(rawEventDialog.event.id);
                      }}
                      className="text-xs"
                    >
                      Copy Event ID
                    </Button>
                  </div>
                )}
              </div>

              {/* JSON Data Section */}
              <div className="flex-1 overflow-auto">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-auto whitespace-pre-wrap break-all h-full">
                  {rawEventDialog.event ? JSON.stringify(rawEventDialog.event, null, 2) : 'No event data'}
                </pre>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (rawEventDialog.event) {
                  navigator.clipboard.writeText(JSON.stringify(rawEventDialog.event, null, 2));
                }
              }}
              className="mr-2"
            >
              Copy JSON
            </Button>
            <Button onClick={() => setRawEventDialog({ open: false, event: null })}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Forum;