'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const NewsletterManagement = () => {
  const { data: session, status } = useSession();
  const [newsletters, setNewsletters] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', type: 'all' });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [weeklyPreview, setWeeklyPreview] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  // Fetch newsletters
  const fetchNewsletters = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.type !== 'all' && { type: filter.type })
      });

      const response = await fetch(`/api/newsletter/manage?${params}`);
      const data = await response.json();

      if (response.ok) {
        setNewsletters(data.newsletters);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        console.error('Failed to fetch newsletters:', data.error);
      }
    } catch (error) {
      console.error('Newsletter fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate weekly newsletter with custom dates
  const generateCustomNewsletter = async () => {
    if (!customDateRange.startDate || !customDateRange.endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      setActionLoading('generate-custom');
      const response = await fetch('/api/newsletter/generate-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customStartDate: customDateRange.startDate,
          customEndDate: customDateRange.endDate,
          title: `Custom Newsletter - ${customDateRange.startDate} to ${customDateRange.endDate}`,
          subject: `📰 Woxsen Insights Digest - ${new Date(customDateRange.startDate).toLocaleDateString()} to ${new Date(customDateRange.endDate).toLocaleDateString()}`
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Custom newsletter generated successfully: "${data.newsletter.title}"`);
        fetchNewsletters();
        setShowDatePicker(false);
        setCustomDateRange({ startDate: '', endDate: '' });
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Generate custom newsletter error:', error);
      alert('Failed to generate custom newsletter');
    } finally {
      setActionLoading(null);
    }
  };
  const generateWeeklyNewsletter = async () => {
    try {
      setActionLoading('generate');
      const response = await fetch('/api/newsletter/generate-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Weekly newsletter generated successfully: "${data.newsletter.title}"`);
        fetchNewsletters();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Generate weekly error:', error);
      alert('Failed to generate weekly newsletter');
    } finally {
      setActionLoading(null);
    }
  };

  // Preview weekly content
  const previewWeeklyContent = async () => {
    try {
      setActionLoading('preview');
      const response = await fetch('/api/newsletter/generate-weekly');
      const data = await response.json();
      
      if (response.ok) {
        setWeeklyPreview(data);
        setShowPreview(true);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Failed to preview weekly content');
    } finally {
      setActionLoading(null);
    }
  };

  // Send newsletter
  const sendNewsletter = async (newsletterId, isTest = false) => {
    if (isTest && !testEmail) {
      alert('Please enter a test email address');
      return;
    }

    if (!isTest && !confirm('Are you sure you want to send this newsletter to all subscribers?')) {
      return;
    }

    try {
      setActionLoading(newsletterId + (isTest ? '-test' : '-send'));
      
      const response = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsletterId,
          ...(isTest && { testEmail })
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (isTest) {
          alert(`Test email sent to ${testEmail}`);
        } else {
          alert(`Newsletter sent successfully! Results: ${data.results.successful} successful, ${data.results.failed} failed`);
          fetchNewsletters();
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Send newsletter error:', error);
      alert('Failed to send newsletter');
    } finally {
      setActionLoading(null);
      if (isTest) setTestEmail('');
    }
  };

  // Delete newsletter
  const deleteNewsletter = async (newsletterId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      setActionLoading(newsletterId + '-delete');
      
      const response = await fetch(`/api/newsletter/manage?id=${newsletterId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Newsletter deleted successfully');
        fetchNewsletters();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Delete newsletter error:', error);
      alert('Failed to delete newsletter');
    } finally {
      setActionLoading(null);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const classes = {
      'draft': 'bg-gray-100 text-gray-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'sending': 'bg-yellow-100 text-yellow-800',
      'sent': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${classes[status] || 'bg-gray-100 text-gray-800'}`;
  };

  useEffect(() => {
    if (session) {
      fetchNewsletters();
    }
  }, [session, filter]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Management</h1>
        <p className="text-gray-600">Manage and send newsletters to your subscribers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSent || 0}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">📧</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDrafts || 0}</p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm">📝</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth || 0}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">📊</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.avgOpenRate || 0).toFixed(1)}%</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">👁️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={generateWeeklyNewsletter}
            disabled={actionLoading === 'generate'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {actionLoading === 'generate' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <span>🔄</span>
            )}
            Generate Last Week
          </button>
          
          <button
            onClick={() => {
              // Generate for current month
              const now = new Date();
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              
              setCustomDateRange({
                startDate: startOfMonth.toISOString().split('T')[0],
                endDate: endOfMonth.toISOString().split('T')[0]
              });
              setShowDatePicker(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>📅</span>
            This Month's Content
          </button>
          
          <button
            onClick={() => {
              // Generate for last 30 days
              const now = new Date();
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(now.getDate() - 30);
              
              setCustomDateRange({
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0]
              });
              setShowDatePicker(true);
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <span>📆</span>
            Last 30 Days
          </button>
          
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <span>📅</span>
            Custom Date Range
          </button>
          
          <button
            onClick={previewWeeklyContent}
            disabled={actionLoading === 'preview'}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {actionLoading === 'preview' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <span>👁️</span>
            )}
            Preview Weekly Content
          </button>
          
          <button
            onClick={() => window.open('/api/newsletter/preview', '_blank')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <span>🖥️</span>
            Preview Newsletter Template
          </button>
        </div>
        
        {/* Custom Date Picker */}
        {showDatePicker && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Generate Newsletter for Custom Date Range</h3>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={generateCustomNewsletter}
                disabled={actionLoading === 'generate-custom' || !customDateRange.startDate || !customDateRange.endDate}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'generate-custom' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span>✨</span>
                )}
                Generate Custom Newsletter
              </button>
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setCustomDateRange({ startDate: '', endDate: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Newsletters</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading newsletters...</p>
          </div>
        ) : newsletters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No newsletters found</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {newsletters.map((newsletter) => (
                <div key={newsletter._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{newsletter.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{newsletter.subject}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className={getStatusBadge(newsletter.status)}>
                          {newsletter.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {newsletter.type.replace('-', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(newsletter.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`/api/newsletter/preview?id=${newsletter._id}`, '_blank')}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      >
                        Preview
                      </button>
                      
                      {newsletter.status !== 'sent' && (
                        <>
                          <input
                            type="email"
                            placeholder="test@example.com"
                            value={selectedNewsletter === newsletter._id ? testEmail : ''}
                            onChange={(e) => {
                              setTestEmail(e.target.value);
                              setSelectedNewsletter(newsletter._id);
                            }}
                            className="text-xs border border-gray-300 rounded px-2 py-1 w-32"
                          />
                          <button
                            onClick={() => sendNewsletter(newsletter._id, true)}
                            disabled={actionLoading === newsletter._id + '-test' || !testEmail}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 disabled:opacity-50"
                          >
                            {actionLoading === newsletter._id + '-test' ? '...' : 'Test'}
                          </button>
                          
                          <button
                            onClick={() => sendNewsletter(newsletter._id, false)}
                            disabled={actionLoading === newsletter._id + '-send'}
                            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            {actionLoading === newsletter._id + '-send' ? '...' : 'Send'}
                          </button>
                        </>
                      )}
                      
                      {newsletter.status !== 'sent' && (
                        <button
                          onClick={() => deleteNewsletter(newsletter._id, newsletter.title)}
                          disabled={actionLoading === newsletter._id + '-delete'}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {actionLoading === newsletter._id + '-delete' ? '...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showPreview && weeklyPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Weekly Content Preview</h2>
                  <p className="text-gray-600">{weeklyPreview.weekRange?.formatted}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{weeklyPreview.content?.blogs?.length || 0}</div>
                  <div className="text-sm text-blue-800">New Blogs</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{weeklyPreview.content?.research?.length || 0}</div>
                  <div className="text-sm text-green-800">Research Papers</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{weeklyPreview.content?.achievements?.length || 0}</div>
                  <div className="text-sm text-yellow-800">Achievements</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{weeklyPreview.content?.events?.length || 0}</div>
                  <div className="text-sm text-purple-800">Events</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{weeklyPreview.content?.patents?.length || 0}</div>
                  <div className="text-sm text-red-800">Patents</div>
                </div>
              </div>
              
              {weeklyPreview.content?.summary?.totalItems === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No content found for this week.</p>
                  <p className="text-sm mt-2">Try generating for a different week or check if content exists for this period.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {weeklyPreview.content?.blogs?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Blog Posts</h3>
                      <div className="space-y-2">
                        {weeklyPreview.content.blogs.map((blog) => (
                          <div key={blog.id} className="border border-gray-200 rounded-lg p-3">
                            <h4 className="font-medium text-gray-900">{blog.title}</h4>
                            <p className="text-sm text-gray-600">By {blog.author} • {formatDate(blog.publishedDate)}</p>
                            <p className="text-sm text-gray-700 mt-1">{blog.excerpt}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    generateWeeklyNewsletter();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Generate Newsletter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterManagement;
