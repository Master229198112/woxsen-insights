import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Eye, 
  BookOpen,
  User,
  MapPin,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

async function getAuthorData(authorId, searchParams) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    
    // Handle searchParams properly
    const awaitedSearchParams = await searchParams;
    const cleanParams = {};
    
    if (awaitedSearchParams) {
      Object.keys(awaitedSearchParams).forEach(key => {
        if (typeof key === 'string' && typeof awaitedSearchParams[key] === 'string') {
          cleanParams[key] = awaitedSearchParams[key];
        }
      });
    }
    
    const params = new URLSearchParams(cleanParams);
    
    const response = await fetch(`${baseUrl}/api/author/${authorId}?${params}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching author data:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { authorId } = await params;
  const data = await getAuthorData(authorId, {});
  
  if (!data?.author) {
    return {
      title: 'Author Not Found - Woxsen Insights'
    };
  }

  const { author } = data;
  
  return {
    title: `${author.name} - Author Profile | Woxsen Insights`,
    description: `View all posts and insights from ${author.name}, ${author.department} at Woxsen University School of Business.`,
    keywords: `${author.name}, ${author.department}, Woxsen University, author profile`,
    openGraph: {
      title: `${author.name} - Author Profile`,
      description: `View all posts and insights from ${author.name}, ${author.department}.`,
      type: 'profile',
    }
  };
}

export default async function AuthorProfilePage({ params, searchParams }) {
  const { authorId } = await params;
  const data = await getAuthorData(authorId, searchParams);
  
  if (!data) {
    notFound();
  }

  const { author, posts, stats, postsByCategory, pagination } = data;
  const awaitedSearchParams = await searchParams;
  const currentPage = parseInt(awaitedSearchParams?.page) || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Author Profile Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Author Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {author.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            {/* Author Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {author.name}
              </h1>
              
              <div className="flex items-center text-lg text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                {author.department}
              </div>
              
              {author.bio && (
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {author.bio}
                </p>
              )}
              
              <div className="text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {formatDate(stats.memberSince)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Author Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalPosts}</div>
              <div className="text-sm text-gray-600">Published Posts</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalViews.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Views</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.categoriesWritten}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalPosts > 0 ? Math.round(stats.totalViews / stats.totalPosts) : 0}
              </div>
              <div className="text-sm text-gray-600">Avg. Views/Post</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Posts */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Published Posts ({stats.totalPosts})
              </h2>
            </div>

            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">
                    {author.name} hasn't published any posts yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {posts.map((post) => (
                    <Card key={post._id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                      <Link href={`/blog/${post.slug || post._id}`}>
                        <div className="relative h-48">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-6">
                          <div className="mb-2">
                            <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded">
                              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(post.publishedAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{post.views} views</span>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.total > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Link 
                      href={`?page=${currentPage - 1}`}
                      className={currentPage === 1 ? 'pointer-events-none' : ''}
                    >
                      <Button
                        variant="outline"
                        disabled={!pagination.hasPrev}
                        className="flex items-center"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                    </Link>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, pagination.total))].map((_, index) => {
                        let pageNum;
                        if (pagination.total <= 5) {
                          pageNum = index + 1;
                        } else if (currentPage <= 3) {
                          pageNum = index + 1;
                        } else if (currentPage >= pagination.total - 2) {
                          pageNum = pagination.total - 4 + index;
                        } else {
                          pageNum = currentPage - 2 + index;
                        }
                        
                        return (
                          <Link key={pageNum} href={`?page=${pageNum}`}>
                            <Button
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                    
                    <Link 
                      href={`?page=${currentPage + 1}`}
                      className={currentPage === pagination.total ? 'pointer-events-none' : ''}
                    >
                      <Button
                        variant="outline"
                        disabled={!pagination.hasNext}
                        className="flex items-center"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Writing Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {postsByCategory.length === 0 ? (
                  <p className="text-gray-500 text-sm">No posts yet</p>
                ) : (
                  <div className="space-y-3">
                    {postsByCategory.map((category) => (
                      <div key={category._id} className="flex items-center justify-between">
                        <span className="text-gray-700 capitalize">
                          {category._id.replace('-', ' ')}
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                          {category.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
