import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import SmartImageWithAI from '@/components/ui/SmartImageWithAI';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  BookOpen, 
  Trophy, 
  Lightbulb, 
  Calendar, 
  Users, 
  TrendingUp,
  ArrowRight,
  Eye,
  Search,
  PenTool,
  Handshake
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

async function getHomepageData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    console.log('Homepage: Fetching from', `${baseUrl}/api/homepage`);
    
    const response = await fetch(`${baseUrl}/api/homepage`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch homepage data:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('Homepage: Received data with', {
      featuredPosts: data.featuredPosts?.length || 0,
      recentPosts: data.recentPosts?.length || 0
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomepageData();

  // Fallback data if API fails
  const fallbackData = {
    featuredPosts: [],
    recentPosts: [],
    categoryPosts: {},
    stats: {
      totalPublished: 0,
      totalAuthors: 0,
      totalViews: 0,
      categoryCounts: {}
    }
  };

  const {
    featuredPosts,
    recentPosts,
    stats
  } = data || fallbackData;

  const categories = [
    {
      name: 'research',
      label: 'Research & Publications',
      description: 'Cutting-edge research findings, academic studies, and scholarly publications',
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
      count: (stats.categoryCounts?.research || 0) + (stats.categoryCounts?.publications || 0)
    },
    {
      name: 'achievements',
      label: 'Achievements',
      description: 'Student and faculty accomplishments',
      icon: Trophy,
      color: 'bg-yellow-50 text-yellow-600',
      count: stats.categoryCounts?.achievements || 0
    },
    {
      name: 'events',
      label: 'Events',
      description: 'Campus events and conferences',
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600',
      count: stats.categoryCounts?.events || 0
    },
    {
      name: 'patents',
      label: 'Patents',
      description: 'Innovation and intellectual property',
      icon: Lightbulb,
      color: 'bg-pink-50 text-pink-600',
      count: stats.categoryCounts?.patents || 0
    },
    {
      name: 'case-studies',
      label: 'Case Studies',
      description: 'Real-world business case studies and practical applications',
      icon: Search,
      color: 'bg-indigo-50 text-indigo-600',
      count: stats.categoryCounts?.['case-studies'] || 0
    },
    {
      name: 'blogs',
      label: 'Blogs',
      description: 'General insights, opinions, and thought leadership pieces',
      icon: PenTool,
      color: 'bg-emerald-50 text-emerald-600',
      count: stats.categoryCounts?.blogs || 0
    },
    {
      name: 'industry-collaborations',
      label: 'Industry Collaborations',
      description: 'Partnerships, collaborations, and strategic industry connections',
      icon: Handshake,
      color: 'bg-cyan-50 text-cyan-600',
      count: stats.categoryCounts?.['industry-collaborations'] || 0
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Welcome Section - Replace Hero */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Woxsen University
              <span className="block text-2xl md:text-3xl font-normal mt-2 text-blue-100">
                School of Business Insights
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover the latest research, achievements, and insights from our vibrant academic community.
            </p>
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Join Our Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalPublished}</div>
              <div className="text-gray-600">Published Insights</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalAuthors}</div>
              <div className="text-gray-600">Active Contributors</div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalViews.toLocaleString()}</div>
              <div className="text-gray-600">Total Views</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Insights</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Highlighted content from our academic community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post._id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <SmartImageWithAI
                      src={post.featuredImage}
                      alt={post.title}
                      imageAnalysis={post.imageAnalysis}
                      variant="full"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      aiLabelPosition="bottom-right"
                      aiLabelSize="small"
                      showAILabel={true}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded">
                        Featured
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded">
                        {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.author.name}</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <Link href={`/blog/${post.slug || post._id}`} className="block mt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        Read More
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Latest Insights</h2>
              <p className="text-xl text-gray-600">Fresh perspectives from our academic community</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentPosts.map((post) => (
                <Link key={post._id} href={`/blog/${post.slug || post._id}`} className="group">
                  <article>
                    <div className="relative h-40 mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <SmartImageWithAI
                        src={post.featuredImage}
                        alt={post.title}
                        imageAnalysis={post.imageAnalysis}
                        variant="full"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        aiLabelPosition="bottom-right"
                        aiLabelSize="small"
                        showAILabel={true}
                      />
                    </div>
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded">
                        {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-3">
                      <span>{post.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Showcase */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover insights across different areas of expertise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.filter(cat => cat.count > 0).map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.name} className="group hover:shadow-lg transition-shadow">
                  <Link href={`/category/${category.name}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${category.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-semibold text-gray-500">
                          {category.count} {category.count === 1 ? 'Post' : 'Posts'}
                        </span>
                      </div>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {category.label}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                        Explore {category.label}
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Insights?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of researchers, faculty, and students. 
            Share your discoveries and contribute to the knowledge ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Join Our Community
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Sign In to Write
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
