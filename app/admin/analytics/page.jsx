'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  FileText, 
  Eye,
  MessageSquare,
  BarChart3,
  PieChart,
  Award
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchAnalytics();
  }, [session, status, router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load analytics data</p>
          <Button onClick={fetchAnalytics} className="mt-4">Retry</Button>
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      title: 'Total Users',
      value: analytics.users.total,
      change: '+' + analytics.users.pending + ' pending',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Published Blogs',
      value: analytics.blogs.published,
      change: '+' + analytics.blogs.pending + ' pending',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Views',
      value: analytics.engagement.totalViews.toLocaleString(),
      change: `${analytics.engagement.averageViewsPerBlog} avg per blog`,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Comments',
      value: analytics.engagement.totalComments,
      change: 'All time',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Platform Analytics
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into your Woxsen Insights platform performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewStats.map((stat, index) => {
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
                      <p className="text-xs text-gray-500">{stat.change}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Content Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.analytics.categoryStats.length > 0 ? (
                <div className="space-y-4">
                  {analytics.analytics.categoryStats.map((category, index) => {
                    const total = analytics.analytics.categoryStats.reduce((sum, cat) => sum + cat.count, 0);
                    const percentage = Math.round((category.count / total) * 100);
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' :
                            index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="font-medium capitalize">{category._id}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{category.count}</div>
                          <div className="text-sm text-gray-500">{percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <PieChart className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No published content yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Authors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.analytics.topAuthors.length > 0 ? (
                <div className="space-y-4">
                  {analytics.analytics.topAuthors.slice(0, 5).map((author, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-bold text-blue-600">
                            {author.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{author.name}</div>
                          <div className="text-sm text-gray-500">{author.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{author.blogCount} blogs</div>
                        <div className="text-sm text-gray-500">{author.totalViews} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No contributors yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Content Creation Trends (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.analytics.monthlyBlogStats.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {analytics.analytics.monthlyBlogStats.map((month, index) => {
                    const monthName = new Date(month._id.year, month._id.month - 1).toLocaleString('default', { month: 'short' });
                    return (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{month.count}</div>
                        <div className="text-sm text-gray-600">{monthName} {month._id.year}</div>
                        <div className="text-xs text-green-600">{month.published} published</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-sm text-gray-500 text-center">
                  Total blogs created and published over the last 6 months
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No data available for the selected period</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Insights */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Platform Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.users.approved > 0 ? Math.round((analytics.blogs.published / analytics.users.approved) * 10) / 10 : 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg blogs per user</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round((analytics.users.approved / analytics.users.total) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">User approval rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics.blogs.total > 0 ? Math.round((analytics.blogs.published / analytics.blogs.total) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Blog approval rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
