import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Book, Bitcoin, Globe, Users, FileText, Scale, Target, GraduationCap, MapPin, MessageCircle, Mic } from 'lucide-react';

const Resources = () => {
  useSeoMeta({
    title: 'Resources - Orange Party',
    description: 'Educational resources, websites, and materials related to Bitcoin, free speech, and the Orange Party movement.',
  });

  const resources = [
    {
      title: 'THE Bitcoin Podcast',
      description: 'Dynamic Bitcoin-focused podcast by Walker featuring Bitcoin Talk interviews, News Roundups, and Bitcoin Out Loud readings. Educational content with an irreverent, straightforward approach emphasizing that "Bitcoin doesn\'t care."',
      url: 'https://bitcoinpodcast.net',
      category: 'Bitcoin Education',
      icon: <Mic className="h-5 w-5" />,
      color: 'blue',
      special: 'origin' as const
    },
    {
      title: 'Bitcoin Orange Party',
      description: 'A political movement tracker for Bitcoin supporters. Promotes the idea that "if you actively support Bitcoin, you are part of the global decentralized Orange Party" - transcending traditional political party lines through Bitcoin advocacy.',
      url: 'https://bitcoinorangeparty.com',
      category: 'Orange Party',
      icon: <Bitcoin className="h-5 w-5" />,
      color: 'orange'
    },
    {
      title: 'Satoshi Nakamoto Institute',
      description: 'A nonprofit organization preserving Bitcoin\'s intellectual history. Features "The Complete Satoshi" archive, foundational cryptography texts, and educational content contextualizing Bitcoin within the broader narrative of cryptography and freedom.',
      url: 'https://nakamotoinstitute.org',
      category: 'Bitcoin Education',
      icon: <Book className="h-5 w-5" />,
      color: 'blue'
    },
    {
      title: 'Bitcoin Policy Institute',
      description: 'A think tank providing rigorous, interdisciplinary analysis of Bitcoin\'s impact on national security, financial inclusion, human rights, and energy. Offers research that moves past hype and cynicism to understand how Bitcoin is changing society\'s relationship with money.',
      url: 'https://www.btcpolicy.org',
      category: 'Policy & Advocacy',
      icon: <Scale className="h-5 w-5" />,
      color: 'green'
    },
    {
      title: 'Satoshi Action Fund',
      description: 'A Bitcoin advocacy organization focused on promoting Bitcoin through policy initiatives and educational efforts. Works to advance Bitcoin adoption and understanding at the policy level.',
      url: 'https://www.satoshiaction.io',
      category: 'Policy & Advocacy',
      icon: <Target className="h-5 w-5" />,
      color: 'green'
    },
    {
      title: 'Learn Me A Bitcoin',
      description: 'Comprehensive educational website by Greg Walker explaining how Bitcoin works in an accessible way. Features beginner guides, technical details for programmers, practical tools, and a blockchain explorer - all completely free.',
      url: 'https://learnmeabitcoin.com',
      category: 'Bitcoin Education',
      icon: <GraduationCap className="h-5 w-5" />,
      color: 'blue'
    },
    {
      title: 'BitDevs Cities',
      description: 'Directory of local BitDevs meetup groups worldwide hosting Socratic Seminars for Bitcoin research and development discussion. A community-driven platform fostering technical discussions and connections among Bitcoin developers.',
      url: 'https://bitdevs.org/cities',
      category: 'Bitcoin Education',
      icon: <MapPin className="h-5 w-5" />,
      color: 'blue'
    },
    {
      title: 'Delving Bitcoin',
      description: 'Online forum for in-depth exploration of Bitcoin with categories for Implementation, Protocol Design, Economics, and Philosophy. Provides structured spaces for developers, researchers, and enthusiasts to dig deep into Bitcoin through nuanced technical and philosophical discussions.',
      url: 'https://delvingbitcoin.org',
      category: 'Bitcoin Education',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'blue'
    }
  ];

  const categories = [
    {
      name: 'Orange Party',
      description: 'Resources related to the Orange Party movement and community',
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    },
    {
      name: 'Bitcoin Education',
      description: 'Educational materials about Bitcoin, sound money, and monetary theory',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    },
    {
      name: 'Policy & Advocacy',
      description: 'Organizations focused on Bitcoin policy research and advocacy efforts',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b border-orange-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🍊</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Orange Party</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resources & Links</p>
            </div>
          </Link>
          <nav className="flex items-center space-x-3 sm:space-x-6">
            <Link to="/forum" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hidden sm:block">Forum</Link>
            <Link to="/politician-monitor" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hidden sm:block">Political Monitor</Link>
            <Link
              to="/"
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 text-sm"
            >
              ← Back to Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Resources & Links
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Curated collection of educational resources, websites, and materials related to Bitcoin,
            free speech, and the Orange Party movement.
          </p>
        </div>

        {/* Categories Overview */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card key={index} className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge className={category.color}>
                    {category.name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            External Resources
          </h2>

          <div className="grid gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="border-orange-200 dark:border-gray-600 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          resource.color === 'orange'
                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'
                            : resource.color === 'blue'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                            : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                        }`}>
                          {resource.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{resource.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {resource.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {resource.description}
                  </CardDescription>
                  {resource.special === 'origin' && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-2 border-orange-300 dark:border-orange-600 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">🍊</span>
                        </div>
                        <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
                          Origin of This Site
                        </p>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mb-4 leading-relaxed">
                        This Orange Party forum was directly inspired by a groundbreaking episode featuring <strong>American HODL</strong>, <strong>Eric Cason</strong>, and <strong>Guy Swann</strong> discussing Bitcoin as a "non-violent, property-rights-based third way" forward in turbulent times.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href="https://fountain.fm/episode/6vtEdgehdhsP7KJtlBND"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <Mic className="h-4 w-4" />
                          Listen to the Origin Episode
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center">
                          "This is the time for bravery, courage, and more speech."
                        </div>
                      </div>
                    </div>
                  )}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      resource.color === 'orange'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : resource.color === 'blue'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    Visit Site
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {resource.url}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="border-orange-200 dark:border-gray-600 bg-orange-50 dark:bg-orange-900/20">
            <CardContent className="py-8">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Have a Resource to Share?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Know of educational content, websites, or materials that would benefit the Orange Party community?
                Share them in our forum discussion.
              </p>
              <Link
                to="/forum"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Users className="h-4 w-4" />
                Join the Discussion
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-orange-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 mt-12">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Vibe Coded with 🧡 for the Orange Party community
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
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
          <div className="border-t border-orange-200 dark:border-gray-600 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Note:</strong> External links lead to independent websites not affiliated with this Orange Party forum.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Please verify information and use your own judgment when exploring external resources.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Resources;