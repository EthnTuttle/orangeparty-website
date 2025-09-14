import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, MessageSquare, Share, Calendar, User, Search, Plus } from 'lucide-react';

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
}

const Forum = () => {
  const [posts] = useState<Post[]>([
    {
      id: '1',
      title: 'Bitcoin as the Third Way: A Non-Violent Revolution',
      content: 'This idea of Bitcoin being the third way politically is really important because it\'s a disengagement through technology in the most radical way of nonviolence...',
      author: 'hodl_american',
      category: 'Bitcoin',
      upvotes: 127,
      downvotes: 8,
      comments: 45,
      timestamp: '2024-01-15T10:30:00Z',
      isStickied: true,
    },
    {
      id: '2',
      title: 'Defending Free Speech in Dangerous Times',
      content: 'The recent events have shown us how crucial it is to protect our First Amendment rights. We must speak ten times louder when faced with attempts to silence us.',
      author: 'constitutional_defender',
      category: 'Free Speech',
      upvotes: 89,
      downvotes: 12,
      comments: 32,
      timestamp: '2024-01-15T08:45:00Z',
    },
    {
      id: '3',
      title: 'The Banality of Evil in Modern Politics',
      content: 'Hannah Arendt\'s concept of the "banality of evil" perfectly describes what we\'re seeing today. People supporting violence without real thought or reflection.',
      author: 'philosophy_student',
      category: 'Philosophy',
      upvotes: 156,
      downvotes: 23,
      comments: 67,
      timestamp: '2024-01-14T16:20:00Z',
    },
    {
      id: '4',
      title: 'Building Bridges Through Technology',
      content: 'Instead of fighting for control of existing systems, we should focus on building new ones that serve humanity better.',
      author: 'tech_optimist',
      category: 'Technology',
      upvotes: 78,
      downvotes: 5,
      comments: 28,
      timestamp: '2024-01-14T14:10:00Z',
    },
    {
      id: '5',
      title: 'The American Renaissance: Returning to Core Principles',
      content: 'We need to get back to the founding principles that made America great while embracing the technological innovations of our time.',
      author: 'patriot_builder',
      category: 'Politics',
      upvotes: 201,
      downvotes: 34,
      comments: 89,
      timestamp: '2024-01-14T12:00:00Z',
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Bitcoin', 'Free Speech', 'Philosophy', 'Technology', 'Politics'];

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
    <Card className={`border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${post.isStickied ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : ''}`}>
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
            <CardTitle className="text-lg hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer">
              {post.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm mt-2">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                u/{post.author}
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
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
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
            <Button variant="ghost" size="sm" className="h-8">
              <MessageSquare className="h-4 w-4 mr-1" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🍊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Orange Party</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Community Forum</p>
            </div>
          </Link>
          <div className="flex items-center space-x-4">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
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
                  A community discussion platform exploring Bitcoin, free speech, and peaceful solutions to societal challenges.
                </p>
                <Badge variant="secondary" className="mb-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
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
                <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
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
    </div>
  );
};

export default Forum;