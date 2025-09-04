'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PenTool, 
  FileText, 
  BarChart3, 
  User,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({ 
    pending: 0, 
    published: 0, 
    total: 0, 
    totalViews: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchUserBlogs();
  }, [session, status, router]);

  const fetchUserBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/blogs');
      const data = await response.json();
      
      if (response.ok) {
        setBlogs(data.blogs);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch user blogs error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600">
            {session.user.department} • {session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1)}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Blogs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create New Blog */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="h-5 w-5 mr-2" />
                Share Your Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Ready to share your knowledge with the Woxsen community? Create a new blog post about your research, achievements, or insights.
              </p>
              
              <div className="space-y-4">
                <Link href="/dashboard/create">
                  <Button className="w-full" size="lg">
                    <PenTool className="h-5 w-5 mr-2" />
                    Create New Blog Post
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
                  <span className="text-2xl font-bold text-blue-600">
                    {session.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">{session.user.name}</h3>
                  <p className="text-sm text-gray-600">{session.user.email}</p>
                  <p className="text-sm text-gray-500">{session.user.department}</p>
                </div>
                
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full" size="sm">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Blogs */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Blogs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p>Loading your blogs...</p>
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">No blogs yet</p>
                  <p className="text-sm mb-4">Start sharing your insights with the community!</p>
                  <Link href="/dashboard/create">
                    <Button>
                      <PenTool className="h-4 w-4 mr-2" />
                      Write Your First Blog
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogs.slice(0, 3).map((blog) => (
                    <div key={blog._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{blog.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            blog.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            blog.status === 'published' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {blog.status}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {blog.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {blogs.length > 3 && (
                    <div className="text-center pt-4">
                      <Button variant="outline">View All My Blogs</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
