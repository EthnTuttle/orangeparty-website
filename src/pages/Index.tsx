import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  useSeoMeta({
    title: 'Orange Party - A Third Way Forward',
    description: 'The Orange Party represents a peaceful, technology-driven path beyond traditional left-right politics through Bitcoin and free speech.',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="p-4 sm:p-6 border-b border-orange-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🍊</span>
            </div>
            <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Orange Party</h1>
          </div>
          <nav className="flex items-center space-x-3 sm:space-x-6">
            <Link to="/forum" className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hidden sm:block">Forum</Link>
            <Button variant="outline" size="sm" className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900">
              <Link to="/forum" className="sm:hidden">Forum</Link>
              <span className="hidden sm:inline">Join Discussion</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Not an Official Political Party
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            A Third Way Forward
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            The Orange Party represents a peaceful, technology-driven path beyond traditional left-right politics.
            We believe in Bitcoin as a non-violent solution to systemic problems, free speech as a fundamental right,
            and building the future through innovation rather than division.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link to="/forum">Join the Discussion</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white/70 dark:bg-gray-800/70">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Our Core Principles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400">🗣️ Free Speech</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Defending the fundamental right to speak freely and engage in open dialogue,
                  even when facing disagreement or controversy.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400">₿ Bitcoin as Liberation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Bitcoin represents technological disengagement from violence and a path to
                  individual sovereignty through sound money.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400">🕊️ Non-Violence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  We reject political violence and believe in building solutions through
                  peaceful dialogue and technological innovation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400">🏛️ Beyond Left-Right</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Moving past the false binary of traditional politics to focus on
                  fundamental human rights and technological solutions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400">🌍 Global Perspective</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  A multiracial, multiethnic coalition of freedom-minded individuals
                  united by shared principles rather than identity.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-orange-600 dark:text-orange-400">🚀 Rational Optimism</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Believing in human potential and the power of innovation to create
                  a more prosperous and free world for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Topics from Transcript */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
            Key Discussions
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-xl">The Importance of Free Speech</CardTitle>
                <CardDescription>Defending the First Amendment in dangerous times</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  The recent tragic events have highlighted the critical importance of protecting
                  free speech and the ability to engage in open debate without fear of violence.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  "This is the time for bravery, courage, and more speech. We must speak
                  ten times louder when faced with attempts to silence us."
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-xl">Bitcoin: The Third Way</CardTitle>
                <CardDescription>Technology-driven solutions to political problems</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Bitcoin offers a radical form of non-violent disengagement through technology,
                  providing a path beyond traditional left-right political paradigms.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  "We are the third path between nihilistic fascism and communism -
                  we are rational optimism."
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-xl">Cultural Change Through Technology</CardTitle>
                <CardDescription>Building the future rather than fighting for control</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  True change comes through cultural transformation enabled by technology,
                  not through political power struggles over who controls the money printer.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  "Fix the money, fix the world. This isn't just a meme - it's the
                  foundational truth of systemic change."
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-gray-600">
              <CardHeader>
                <CardTitle className="text-xl">American Renaissance</CardTitle>
                <CardDescription>Returning to core constitutional principles</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Bitcoin represents a return to American ideals of individual sovereignty,
                  property rights, and freedom from tyrannical control.
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  "We believe in a multiracial, multiethnic, multinational coalition
                  of freedom-minded individuals."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-orange-500 dark:bg-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Join the Conversation
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            The Orange Party is a community-driven discussion platform. Share your thoughts,
            engage in meaningful dialogue, and help build a better future through peaceful means.
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100">
            <Link to="/forum">Enter the Forum</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 border-t border-orange-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>Disclaimer:</strong> The Orange Party is not an official political party.
              This is a community discussion platform exploring ideas around Bitcoin, free speech,
              and peaceful solutions to societal challenges.
            </p>
            <Separator className="my-4" />
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Built with React, TypeScript, and Tailwind CSS. Powered by the principles of
              free speech and technological innovation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
