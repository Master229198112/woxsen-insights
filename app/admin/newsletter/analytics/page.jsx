'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Mail, 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Target,
  AlertCircle,
  Calendar,
  Clock
} from 'lucide-react';

const NewsletterAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalSent: 0,
      totalSubscribers: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      growthRate: 0,
      unsubscribeRate: 0
    },
    recentNewsletters: [],
    subscriberGrowth: [],
    topPerformingContent: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // Changed to 7 days since they started last week
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/newsletter/analytics?days=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        // Since they just started, show minimal real data
        const realData = {
          overview: {
            totalSent: 0,
            totalSubscribers: 0,
            avgOpenRate: 0,
            avgClickRate: 0,
            growthRate: 0,
            unsubscribeRate: 0
          },
          recentNewsletters: [],
          subscriberGrowth: [],
          topPerformingContent: []
        };
        setAnalytics(realData);
      }
    } catch (error) {
      console.error('Analytics fetch error:', error);
      // Set empty state for new website
      setAnalytics({
        overview: {
          totalSent: 0,
          totalSubscribers: 0,
          avgOpenRate: 0,
          avgClickRate: 0,
          growthRate: 0,
          unsubscribeRate: 0
        },
        recentNewsletters: [],
        subscriberGrowth: [],
        topPerformingContent: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh analytics
  const refreshAnalytics = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  // Export analytics
  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/newsletter/analytics/export?days=${dateRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-analytics-${dateRange}days.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export feature will be available once you have analytics data to export');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Analytics</h1>
          <p className="text-gray-600">Track your newsletter performance and engagement metrics</p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          
          <Button
            onClick={refreshAnalytics}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={exportAnalytics}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSent}</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Subscribers</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSubscribers}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgOpenRate}%</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgClickRate}%</p>
                  </div>
                  <MousePointer className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.growthRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Unsubscribe Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.unsubscribeRate}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts/Data Section */}
          {analytics.recentNewsletters.length > 0 ? (
            <>
              {/* Subscriber Growth and Engagement Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Subscriber Growth Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.subscriberGrowth.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.subscriberGrowth.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">{item.period}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${(item.subscribers / Math.max(...analytics.subscriberGrowth.map(s => s.subscribers))) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-bold text-gray-900 w-16 text-right">{item.subscribers}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No growth data yet</p>
                        <p className="text-sm">Data will appear after you send newsletters</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Top Performing Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.topPerformingContent.length > 0 ? (
                      <div className="space-y-4">
                        {analytics.topPerformingContent.map((content, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{content.title}</h4>
                              <p className="text-xs text-gray-500">{content.category}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">{content.opens} opens</div>
                              <div className="text-xs text-gray-500">{content.clicks} clicks</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No content performance data yet</p>
                        <p className="text-sm">Send newsletters to see top performing content</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Newsletter Performance */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Recent Newsletter Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Newsletter</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opens</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {analytics.recentNewsletters.map((newsletter) => (
                          <tr key={newsletter.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{newsletter.title}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{new Date(newsletter.sentDate).toLocaleDateString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{newsletter.recipients}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{newsletter.opens || 0}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{newsletter.clicks || 0}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`text-sm font-medium ${
                                newsletter.openRate > 25 ? 'text-green-600' : 
                                newsletter.openRate > 20 ? 'text-yellow-600' : 
                                newsletter.openRate > 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {newsletter.openRate}%
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={`text-sm font-medium ${
                                newsletter.clickRate > 4 ? 'text-green-600' : 
                                newsletter.clickRate > 2 ? 'text-yellow-600' : 
                                newsletter.clickRate > 0 ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {newsletter.clickRate}%
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                {newsletter.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* No Data State */
            <Card className="mb-8">
              <CardContent className="p-12">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Analytics will appear here once you start sending newsletters to your subscribers. 
                    Create and send your first newsletter to see performance metrics.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/admin/newsletter'}>
                      <Mail className="h-4 w-4 mr-2" />
                      Create Newsletter
                    </Button>
                    <Button variant="outline" onClick={() => window.location.href = '/admin/newsletter/subscribers'}>
                      <Users className="h-4 w-4 mr-2" />
                      Manage Subscribers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Getting Started Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                Getting Started with Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">How to Get Analytics Data</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>To start seeing analytics data on this dashboard:</p>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>Create and send your first newsletter from the Newsletter Dashboard</li>
                        <li>Build your subscriber list by sharing your newsletter landing page</li>
                        <li>Enable email tracking to see open and click rates</li>
                        <li>Analytics will start appearing within 24 hours of sending</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NewsletterAnalytics;