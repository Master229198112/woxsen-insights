'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const NewsletterAnalytics = () => {
  const { data: session, status } = useSession();
  const [analytics, setAnalytics] = useState({
    overview: {
      totalSent: 0,
      totalSubscribers: 0,
      avgOpenRate: 0,
      avgClickRate: 0,
      growthRate: 0
    },
    recentNewsletters: [],
    subscriberGrowth: [],
    performanceMetrics: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use mock data since we haven't implemented tracking yet
      // In a real implementation, this would call an analytics API
      
      // Mock analytics data
      const mockData = {
        overview: {
          totalSent: 156,
          totalSubscribers: 1250,
          avgOpenRate: 24.5,
          avgClickRate: 3.2,
          growthRate: 12.8
        },
        recentNewsletters: [
          {
            id: 1,
            title: 'Weekly Digest - Nov 4-10',
            sentDate: new Date('2024-11-11'),
            recipients: 1230,
            openRate: 26.3,
            clickRate: 4.1,
            status: 'sent'
          },
          {
            id: 2,
            title: 'Weekly Digest - Oct 28-Nov 3',
            sentDate: new Date('2024-11-04'),
            recipients: 1205,
            openRate: 22.8,
            clickRate: 2.9,
            status: 'sent'
          },
          {
            id: 3,
            title: 'Research Highlights - October',
            sentDate: new Date('2024-10-31'),
            recipients: 1190,
            openRate: 28.7,
            clickRate: 5.2,
            status: 'sent'
          }
        ],
        subscriberGrowth: [
          { month: 'Jul', subscribers: 980 },
          { month: 'Aug', subscribers: 1050 },
          { month: 'Sep', subscribers: 1120 },
          { month: 'Oct', subscribers: 1180 },
          { month: 'Nov', subscribers: 1250 }
        ],
        performanceMetrics: [
          { metric: 'Best Open Rate', value: '32.4%', newsletter: 'Research Breakthrough Alert' },
          { metric: 'Best Click Rate', value: '6.8%', newsletter: 'Event Announcements' },
          { metric: 'Most Popular Day', value: 'Monday', detail: '65% higher engagement' },
          { metric: 'Optimal Send Time', value: '9:00 AM', detail: 'Based on open patterns' }
        ]
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session, dateRange]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Analytics</h1>
        <p className="text-gray-600">Track your newsletter performance and engagement metrics</p>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Time Period:</label>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSent}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📧</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSubscribers.toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgOpenRate}%</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">👁️</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.avgClickRate}%</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">🖱️</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                  <p className="text-2xl font-bold text-gray-900">+{analytics.overview.growthRate}%</p>
                </div>
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-sm">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Subscriber Growth Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscriber Growth</h2>
              <div className="space-y-4">
                {analytics.subscriberGrowth.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600">{item.month} 2024</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(item.subscribers / Math.max(...analytics.subscriberGrowth.map(s => s.subscribers))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-900 w-16 text-right">{item.subscribers}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h2>
              <div className="space-y-4">
                {analytics.performanceMetrics.map((metric, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{metric.metric}</h3>
                      <span className="text-xl font-bold text-blue-600">{metric.value}</span>
                    </div>
                    <p className="text-sm text-gray-600">{metric.newsletter || metric.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Newsletter Performance */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Newsletter Performance</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Newsletter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
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
                        <div className="text-sm text-gray-900">{formatDate(newsletter.sentDate)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{newsletter.recipients.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`text-sm font-medium ${
                            newsletter.openRate > 25 ? 'text-green-600' : 
                            newsletter.openRate > 20 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {newsletter.openRate}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm font-medium ${
                          newsletter.clickRate > 4 ? 'text-green-600' : 
                          newsletter.clickRate > 2 ? 'text-yellow-600' : 'text-red-600'
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
            
            {analytics.recentNewsletters.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <p>No newsletter data available yet.</p>
                <p className="text-sm mt-1">Send some newsletters to see analytics here.</p>
              </div>
            )}
          </div>

          {/* Note about Analytics */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-lg">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">About Analytics</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>Currently showing mock data for demonstration. To get real analytics:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Implement email tracking pixels for open rates</li>
                    <li>• Add click tracking for all newsletter links</li>
                    <li>• Set up database tables to store engagement metrics</li>
                    <li>• Configure webhooks for real-time tracking updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewsletterAnalytics;
