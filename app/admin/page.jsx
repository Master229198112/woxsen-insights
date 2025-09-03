'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    pendingUsers: 0,
    totalUsers: 0,
    pendingBlogs: 0,
    publishedBlogs: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const usersResponse = await fetch('/api/admin/users?status=all');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        const pendingUsers = usersData.users.filter(user => !user.isApproved).length;
        
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.users.length,
          pendingUsers
        }));
      }
      
      // TODO: Fetch blog stats when we implement blogs
      setStats(prev => ({
        ...prev,
        pendingBlogs: 5, // Placeholder
        publishedBlogs: 23, // Placeholder
        totalViews: 1245 // Placeholder
      }));
      
    } catch (error) {
      console.error('Fetch stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading admin dashboard...</p>
      </div>
    </div>;
  }

  const quickActions = [
    {
      title: 'User Management',
      description: 'Approve new user registrations',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500',
      urgent: stats.pendingUsers > 0
    },
    {
      title: 'Blog Management',
      description: 'Review and publish blog posts',
      icon: FileText,
      href: '/admin/blogs',
      color: 'bg-green-500',
      urgent: stats.pendingBlogs > 0
    },
    {
      title: 'Analytics',
      description: 'View platform statistics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500',
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
      value: stats.pendingUsers,
      icon: Clock,
      color: stats.pendingUsers > 0 ? 'text-yellow-600' : 'text-gray-600',
      bgColor: stats.pendingUsers > 0 ? 'bg-yellow-50' : 'bg-gray-50'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Blogs',
      value: stats.pendingBlogs,
      icon: FileText,
      color: stats.pendingBlogs > 0 ? 'text-orange-600' : 'text-gray-600',
      bgColor: stats.pendingBlogs > 0 ? 'bg-orange-50' : 'bg-gray-50'
    },
    {
      title: 'Published Blogs',
      value: stats.publishedBlogs,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
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
              {stats.pendingUsers > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {stats.pendingUsers} users awaiting approval
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
              {stats.pendingBlogs > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    {stats.pendingBlogs} blogs awaiting review
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
                  <p className="text-xs mt-1">Blog system coming soon!</p>
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
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Blog System</p>
                    <p className="text-sm text-gray-500">In Development</p>
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
