'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  UserCheck,
  PenTool,
  Settings,
  BarChart3,
  Eye,
  Calendar,
  Mail
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Fetch dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading admin dashboard...</p>
      </div>
    </div>;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'User Management',
      description: 'Approve new user registrations',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500',
      urgent: dashboardData.users.pending > 0
    },
    {
      title: 'Blog Management',
      description: 'Review and publish blog posts',
      icon: FileText,
      href: '/admin/blogs',
      color: 'bg-green-500',
      urgent: dashboardData.blogs.pending > 0
    },
    {
      title: 'Newsletter Management',
      description: 'Manage newsletters and subscribers',
      icon: Mail,
      href: '/admin/newsletter',
      color: 'bg-purple-500',
      urgent: false
    },
    {
      title: 'Analytics',
      description: 'View platform statistics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-indigo-500',
      urgent: false
    },
    {
      title: 'Settings',
      description: 'Platform configuration',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500',
      urgent: false
    }
  ];

  const statsCards = [
    {
      title: 'Pending Users',
      value: dashboardData.users.pending,
      icon: Clock,
      color: dashboardData.users.pending > 0 ? 'text-yellow-600' : 'text-gray-600',
      bgColor: dashboardData.users.pending > 0 ? 'bg-yellow-50' : 'bg-gray-50'
    },
    {
      title: 'Total Users',
      value: dashboardData.users.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Blogs',
      value: dashboardData.blogs.pending,
      icon: FileText,
      color: dashboardData.blogs.pending > 0 ? 'text-orange-600' : 'text-gray-600',
      bgColor: dashboardData.blogs.pending > 0 ? 'bg-orange-50' : 'bg-gray-50'
    },
    {
      title: 'Published Blogs',
      value: dashboardData.blogs.published,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Views',
      value: dashboardData.engagement.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name}! Manage your Woxsen Insights platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <Link href={action.href}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${action.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        {action.urgent && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Urgent
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {action.description}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent User Registrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Recent User Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentActivity.pendingUsers.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    {dashboardData.users.pending} users awaiting approval
                  </div>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.pendingUsers.slice(0, 3).map((user, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-bold text-blue-600">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.department}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/admin/users">
                    <Button size="sm" className="w-full">
                      Review Pending Users
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No pending user registrations</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Blog Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="h-5 w-5 mr-2" />
                Recent Blog Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentActivity.pendingBlogs.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    {dashboardData.blogs.pending} blogs awaiting review
                  </div>
                  <div className="space-y-3">
                    {dashboardData.recentActivity.pendingBlogs.slice(0, 3).map((blog, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-8 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={blog.featuredImage}
                            alt={blog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 line-clamp-1">{blog.title}</div>
                          <div className="text-sm text-gray-600">by {blog.author.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{blog.category}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/admin/blogs">
                    <Button size="sm" className="w-full" variant="outline">
                      Review Blog Posts
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No pending blog submissions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Database</p>
                    <p className="text-sm text-gray-500">Connected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Authentication</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Blog System</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
