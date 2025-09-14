'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const SubscriberManagement = () => {
  const { data: session, status } = useSession();
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', source: 'all' });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  // Fetch subscribers
  const fetchSubscribers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.source !== 'all' && { source: filter.source }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/newsletter/subscribers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSubscribers(data.subscribers);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        console.error('Failed to fetch subscribers:', data.error);
      }
    } catch (error) {
      console.error('Subscriber fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle subscriber selection
  const toggleSubscriber = (subscriberId) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId) 
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  // Select all subscribers
  const toggleSelectAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s._id));
    }
  };

  // Bulk unsubscribe
  const bulkUnsubscribe = async () => {
    if (selectedSubscribers.length === 0) return;
    
    if (!confirm(`Are you sure you want to unsubscribe ${selectedSubscribers.length} subscribers?`)) {
      return;
    }

    try {
      setActionLoading('bulk-unsubscribe');
      
      const response = await fetch('/api/newsletter/subscribers/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberIds: selectedSubscribers,
          action: 'unsubscribe'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`Successfully unsubscribed ${data.updated} subscribers`);
        setSelectedSubscribers([]);
        fetchSubscribers();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Bulk unsubscribe error:', error);
      alert('Failed to unsubscribe subscribers');
    } finally {
      setActionLoading(null);
    }
  };

  // Import subscribers from CSV
  const importSubscribers = async () => {
    if (!importFile) {
      alert('Please select a CSV file to import');
      return;
    }

    try {
      setActionLoading('import');
      
      const fileContent = await importFile.text();
      const lines = fileContent.split('\n');
      
      if (lines.length < 2) {
        alert('CSV file should contain at least a header row and one data row');
        return;
      }
      
      // Parse CSV (simple implementation)
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const emailIndex = headers.findIndex(h => h.includes('email'));
      
      if (emailIndex === -1) {
        alert('CSV file must contain an "email" column');
        return;
      }
      
      const subscribers = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row[emailIndex] && row[emailIndex].trim()) {
          subscribers.push({
            email: row[emailIndex].trim(),
            source: 'csv-import'
          });
        }
      }
      
      if (subscribers.length === 0) {
        alert('No valid email addresses found in the CSV file');
        return;
      }
      
      const response = await fetch('/api/newsletter/subscribers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscribers })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setImportResults(data.results);
        fetchSubscribers();
      } else {
        alert(`Import failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import subscribers');
    } finally {
      setActionLoading(null);
    }
  };
  const exportSubscribers = async () => {
    try {
      setActionLoading('export');
      
      const params = new URLSearchParams({
        export: 'true',
        ...(filter.status !== 'all' && { status: filter.status }),
        ...(filter.source !== 'all' && { source: filter.source }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/newsletter/subscribers?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('Subscribers exported successfully');
      } else {
        const data = await response.json();
        alert(`Export failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export subscribers');
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (session) {
        fetchSubscribers(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, filter, session]);

  useEffect(() => {
    if (session) {
      fetchSubscribers();
    }
  }, [session]);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Subscribers</h1>
        <p className="text-gray-600">Manage your newsletter subscriber list</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">👥</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active || 0}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeek || 0}</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">📈</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total > 0 ? ((stats.thisWeek / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <span>📎</span>
              Import CSV
            </button>
            
            <button
              onClick={exportSubscribers}
              disabled={actionLoading === 'export'}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {actionLoading === 'export' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <span>📥</span>
              )}
              Export CSV
            </button>
            
            {selectedSubscribers.length > 0 && (
              <button
                onClick={bulkUnsubscribe}
                disabled={actionLoading === 'bulk-unsubscribe'}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === 'bulk-unsubscribe' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <span>🚫</span>
                )}
                Unsubscribe Selected ({selectedSubscribers.length})
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            {selectedSubscribers.length} of {subscribers.length} selected
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={filter.source}
            onChange={(e) => setFilter({ ...filter, source: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="blog-sidebar">Blog Sidebar</option>
            <option value="footer">Footer</option>
            <option value="homepage">Homepage</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Subscriber List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Subscribers</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </label>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No subscribers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === subscribers.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferences</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber._id)}
                        onChange={() => toggleSubscriber(subscriber._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                      {subscriber.metadata?.ipAddress && (
                        <div className="text-sm text-gray-500">IP: {subscriber.metadata.ipAddress}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        subscriber.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriber.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">
                        {subscriber.source?.replace('-', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(subscriber.subscribedAt)}</div>
                      {subscriber.unsubscribedAt && (
                        <div className="text-sm text-red-600">Unsubscribed: {formatDate(subscriber.unsubscribedAt)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {subscriber.preferences?.weeklyDigest && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Weekly</span>
                        )}
                        {subscriber.preferences?.achievements && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Achievements</span>
                        )}
                        {subscriber.preferences?.publications && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Publications</span>
                        )}
                        {subscriber.preferences?.events && (
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Events</span>
                        )}
                        {subscriber.preferences?.research && (
                          <span className="px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded">Research</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.current} of {pagination.pages} ({pagination.total} total)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchSubscribers(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchSubscribers(pagination.current + 1)}
                disabled={pagination.current >= pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Import Subscribers</h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResults(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {!importResults ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CSV File
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">CSV Format Requirements:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• First row should contain headers</li>
                      <li>• Must include an "email" column</li>
                      <li>• One email per row</li>
                      <li>• Example: email,name</li>
                    </ul>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={importSubscribers}
                      disabled={!importFile || actionLoading === 'import'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === 'import' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <span>📤</span>
                      )}
                      Import Subscribers
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Import Results</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">Successfully Added</span>
                      <span className="font-bold text-green-600">{importResults.added}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800">Updated</span>
                      <span className="font-bold text-blue-600">{importResults.updated}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-800">Skipped</span>
                      <span className="font-bold text-yellow-600">{importResults.skipped}</span>
                    </div>
                    
                    {importResults.errors && importResults.errors.length > 0 && (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {importResults.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                          {importResults.errors.length > 5 && (
                            <li>• ... and {importResults.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setImportResults(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriberManagement;
