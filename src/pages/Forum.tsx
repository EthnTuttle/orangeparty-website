import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Share, Calendar, User, Search, Plus, Crown, ChevronDown, ChevronRight } from 'lucide-react';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { ReplyDialog } from '@/components/ReplyDialog';
import { ReactionCountDisplay } from '@/components/ReactionCountDisplay';
import { LoginArea } from '@/components/auth/LoginArea';
import { useProcessedForumPosts, type ForumPost } from '@/hooks/useForumPosts';
import { useNostrMembers } from '@/hooks/useNostrMembers';

const Forum = () => {
  // Load Orange Party members and forum posts
  const { data: members, isLoading: membersLoading } = useNostrMembers();
  const memberPubkeys = members?.map(m => m.pubkey) || [];
  const { data: posts = [], isLoading } = useProcessedForumPosts(
    memberPubkeys, 
    members,
    { enabled: !!members && memberPubkeys.length > 0 }
  );

  // Debug logging
  console.log('Forum state:', {
    membersLoaded: !!members,
    memberCount: members?.length || 0,
    postsLoaded: posts.length,
    uniqueAuthors: [...new Set(posts.map(p => p.authorName))],
    postsByAuthor: posts.reduce((acc, post) => {
      acc[post.authorName] = (acc[post.authorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [replyDialog, setReplyDialog] = useState<{ open: boolean; parentEventId: string; parentAuthor: string }>({
    open: false,
    parentEventId: '',
    parentAuthor: '',
  });

  const categories = ['all', 'Bitcoin', 'Free Speech', 'Philosophy', 'Technology', 'Politics', 'General'];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesUser = selectedUser === 'all' || post.authorName === selectedUser;
    return matchesSearch && matchesCategory && matchesUser;
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
                </div>
              <CardDescription className="flex items-center gap-4 text-sm mt-2">
                <span className="flex items-center gap-1">
                  {post.isMemberPost ? (
                    <Crown className="h-3 w-3 text-orange-500" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                  <span className="break-all">
                    {post.isMemberPost ? '🍊' : '👤'}{post.authorName}
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
            {post.replies.map((reply) => (
              <Card key={reply.id} className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    {reply.isMemberPost ? (
                      <Crown className="h-3 w-3 text-orange-500" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    <span className="text-sm font-medium break-all">
                      {reply.isMemberPost ? '🍊' : '👤'}{reply.authorName}
                      {reply.isMemberPost && <span className="text-orange-600 dark:text-orange-400 text-xs ml-1">(Member)</span>}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(reply.timestamp)}
                    </span>
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
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Filter by Member</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="space-y-2">
                  <Button
                    variant={selectedUser === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedUser('all')}
                  >
                    All Members
                  </Button>
                  {members?.map((member) => (
                    <Button
                      key={member.pubkey}
                      variant={selectedUser === member.name ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedUser(member.name)}
                    >
                      🍊 {member.name}
                    </Button>
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
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 w-full">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="capitalize">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
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
    </div>
  );
};

export default Forum;