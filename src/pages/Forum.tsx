import { useSeoMeta } from '@unhead/react';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, MessageSquare, Share, Calendar, User, Search, Plus } from 'lucide-react';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { CreatePostDialog } from '@/components/CreatePostDialog';
import { ReplyDialog } from '@/components/ReplyDialog';
import { LoginArea } from '@/components/auth/LoginArea';
import type { NostrEvent } from '@nostrify/nostrify';

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timestamp: string;
  isStickied?: boolean;
  replies?: Post[];
  isReply?: boolean;
  parentId?: string;
}

const Forum = () => {
  const { nostr } = useNostr();

  // Load the Orange Party members from nostr.json
  const orangePartyMembers = useMemo(() => {
    return [
      'd3d74124ddfb5bdc61b8f18d17c3335bbb4f8c71182a35ee27314a49a4eb7b1d', // gary, biz
      '085c56232b428ca56c79e0abc6170a120cd87b01b2e18e30dfdc1fac051d9239', // lexy
      'a44a09581824710735565793993f841d44b36284ab9552ad4a6e124132d1c1f9', // scott
    ];
  }, []);

  // Query recent text notes (kind 1) from Orange Party members
  const { data: nostrEventsData } = useQuery({
    queryKey: ['forum-posts', orangePartyMembers],
    queryFn: async () => {
      const signal = AbortSignal.timeout(5000);
      const events = await nostr.query([{
        kinds: [1], // Text notes
        authors: orangePartyMembers,
        limit: 50,
      }], { signal });
      return events;
    },
    enabled: !!nostr,
  });

  const nostrEvents = useMemo(() => nostrEventsData || [], [nostrEventsData]);

  // Transform Nostr events into forum posts with threading
  const posts = useMemo(() => {
    if (!nostrEvents.length) return [];

    const authorMap: Record<string, string> = {
      'd3d74124ddfb5bdc61b8f18d17c3335bbb4f8c71182a35ee27314a49a4eb7b1d': 'gary',
      '085c56232b428ca56c79e0abc6170a120cd87b01b2e18e30dfdc1fac051d9239': 'lexy',
      'a44a09581824710735565793993f841d44b36284ab9552ad4a6e124132d1c1f9': 'scott',
    };

    // Convert all events to posts first
    const allPosts = nostrEvents.map((event: NostrEvent) => {
      const content = event.content || '';
      const firstLine = content.split('\n')[0] || content.substring(0, 100);

      // Check if this is a reply by looking for 'e' tags
      const replyTags = event.tags?.filter(tag => tag[0] === 'e') || [];
      const isReply = replyTags.length > 0;
      const parentId = isReply ? replyTags[0][1] : undefined;

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
        author: authorMap[event.pubkey] || event.pubkey.substring(0, 8),
        category,
        upvotes: Math.floor(Math.random() * 200) + 10, // Random for demo
        downvotes: Math.floor(Math.random() * 20),
        comments: 0, // Will be calculated
        timestamp: new Date(event.created_at * 1000).toISOString(),
        isStickied: false,
        isReply,
        parentId,
        replies: [],
      };
    });

    // Build threading structure
    const topLevelPosts: Post[] = [];
    const postMap = new Map<string, Post>();

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

    return topLevelPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [nostrEvents]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
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
    return matchesSearch && matchesCategory;
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

  const PostCard = ({ post }: { post: Post }) => (
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
              <CardTitle className="text-lg hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer break-words">
                {post.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 text-sm mt-2">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="break-all">u/{post.author}</span>
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
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-green-100 dark:hover:bg-green-900">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-green-600 dark:text-green-400 min-w-[2rem] text-center">
                  {post.upvotes - post.downvotes}
                </span>
                <Button variant="ghost" size="sm" className="h-8 px-2 hover:bg-red-100 dark:hover:bg-red-900">
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
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

      {/* Threaded Replies */}
      {post.replies && post.replies.length > 0 && (
        <div className="ml-6 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
          {post.replies.map((reply) => (
            <Card key={reply.id} className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-3 w-3" />
                  <span className="text-sm font-medium break-all">u/{reply.author}</span>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(reply.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                  {reply.content}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-green-100 dark:hover:bg-green-900">
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {reply.upvotes - reply.downvotes}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-1 hover:bg-red-100 dark:hover:bg-red-900">
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
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
                <Badge variant="secondary" className="mb-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Live Nostr Feed
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                  Not an Official Political Party
                </Badge>
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
              {!nostrEvents ? (
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

            {/* Pagination placeholder */}
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <Button variant="outline" disabled>Previous</Button>
                <Button variant="outline" className="bg-orange-500 text-white">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
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