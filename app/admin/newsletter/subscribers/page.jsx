'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  BarChart3,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical,
  FileDown,
  UserX,
  Mail,
  Calendar,
  Eye,
  Settings,
  AlertCircle,
  Loader2,
  X,
  FileText,
  Info
} from 'lucide-react';

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

  // Download sample CSV with updated consolidated categories
  const downloadSampleCSV = () => {
    const sampleData = [
      // Header row with all current preference categories
      ['email', 'weeklyDigest', 'achievements', 'research', 'events', 'blogs', 'patents', 'industryCollaborations'],
      // Sample data rows showing different preference combinations
      ['john.doe@example.com', 'true', 'true', 'true', 'true', 'false', 'false', 'true'],
      ['jane.smith@woxsen.edu.in', 'true', 'false', 'true', 'true', 'true', 'true', 'false'],
      ['admin@company.com', 'false', 'true', 'true', 'false', 'true', 'true', 'true'],
      ['researcher@university.edu', 'true', 'true', 'true', 'false', 'false', 'true', 'true']
    ];

    const csvContent = sampleData
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers-sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file should contain at least a header row and one data row');
        return;
      }
      
      // Parse CSV headers
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const emailIndex = headers.findIndex(h => h.includes('email'));
      
      if (emailIndex === -1) {
        alert('CSV file must contain an "email" column');
        return;
      }
      
      const subscribers = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        if (row[emailIndex] && row[emailIndex].trim()) {
          const subscriberData = {
            email: row[emailIndex].trim(),
            source: 'csv-import',
            preferences: {}
          };

          // Map other fields to preferences
          headers.forEach((header, index) => {
            if (header !== 'email' && row[index]) {
              const value = row[index].toLowerCase();
              subscriberData.preferences[header] = value === 'true' || value === '1' || value === 'yes';
            }
          });

          subscribers.push(subscriberData);
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

  // Export subscribers
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

  // Get preference display based on consolidated categories
  const getPreferenceDisplay = (preferences) => {
    const categories = [
      { key: 'weeklyDigest', label: 'Weekly', color: 'bg-blue-100 text-blue-800' },
      { key: 'achievements', label: 'Achievements', color: 'bg-yellow-100 text-yellow-800' },
      { key: 'research', label: 'Research & Publications', color: 'bg-green-100 text-green-800' }, // Updated label
      { key: 'events', label: 'Events', color: 'bg-purple-100 text-purple-800' },
      { key: 'blogs', label: 'Blogs', color: 'bg-indigo-100 text-indigo-800' },
      { key: 'patents', label: 'Patents', color: 'bg-pink-100 text-pink-800' },
      { key: 'industryCollaborations', label: 'Industry Collaborations', color: 'bg-cyan-100 text-cyan-800' }
    ];

    const activePrefs = [];
    
    categories.forEach(cat => {
      if (cat.key === 'research') {
        // Handle consolidated research & publications
        if (preferences?.research || preferences?.publications) {
          activePrefs.push(cat);
        }
      } else if (preferences?.[cat.key]) {
        activePrefs.push(cat);
      }
    });

    return activePrefs;
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
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading newsletter management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6"> {/* Reduced from space-y-8 for better spacing */}
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              Newsletter Subscribers
            </h1>
            <p className="text-gray-600 mt-2">Manage your newsletter subscriber list and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadSampleCSV}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Sample CSV
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> {/* Reduced gap from gap-6 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"> {/* Reduced padding from p-6 to p-5 */}
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"> {/* Reduced padding from p-6 to p-5 */}
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"> {/* Reduced padding */}
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-3xl font-bold text-gray-900">{stats.thisWeek || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"> {/* Reduced padding */}
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total > 0 ? ((stats.thisWeek / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"> {/* Reduced padding from p-6 to p-4 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportSubscribers}
              disabled={actionLoading === 'export'}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {actionLoading === 'export' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </button>
            
            {selectedSubscribers.length > 0 && (
              <button
                onClick={bulkUnsubscribe}
                disabled={actionLoading === 'bulk-unsubscribe'}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading === 'bulk-unsubscribe' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserX className="h-4 w-4 mr-2" />
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"> {/* Reduced padding from p-6 to p-4 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="relative">
            <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filter.source}
              onChange={(e) => setFilter({ ...filter, source: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Sources</option>
              <option value="blog-sidebar">Blog Sidebar</option>
              <option value="footer">Footer</option>
              <option value="homepage">Homepage</option>
              <option value="manual">Manual</option>
              <option value="csv-import">CSV Import</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriber List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200"> {/* Reduced padding from px-6 to px-5 */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Subscribers</h2>
            <label className="flex items-center gap-2 cursor-pointer">
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
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or import new subscribers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> {/* Reduced padding */}
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === subscribers.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th> {/* Reduced padding */}
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> {/* Reduced padding */}
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th> {/* Reduced padding */}
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th> {/* Reduced padding */}
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferences</th> {/* Reduced padding */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4"> {/* Reduced padding */}
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber._id)}
                        onChange={() => toggleSubscriber(subscriber._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-5 py-4"> {/* Reduced padding */}
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                          {subscriber.metadata?.ipAddress && (
                            <div className="text-sm text-gray-500">IP: {subscriber.metadata.ipAddress}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"> {/* Reduced padding */}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        subscriber.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriber.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-4"> {/* Reduced padding */}
                      <span className="text-sm text-gray-900 capitalize">
                        {subscriber.source?.replace('-', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-5 py-4"> {/* Reduced padding */}
                      <div className="text-sm text-gray-900">{formatDate(subscriber.subscribedAt)}</div>
                      {subscriber.unsubscribedAt && (
                        <div className="text-sm text-red-600">Unsubscribed: {formatDate(subscriber.unsubscribedAt)}</div>
                      )}
                    </td>
                    <td className="px-5 py-4"> {/* Reduced padding */}
                      <div className="flex flex-wrap gap-1">
                        {getPreferenceDisplay(subscriber.preferences).map((pref, index) => (
                          <span 
                            key={index}
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${pref.color}`}
                          >
                            {pref.label}
                          </span>
                        ))}
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
          <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between"> {/* Reduced padding from px-6 to px-5 */}
            <div className="text-sm text-gray-700">
              Showing page {pagination.current} of {pagination.pages} ({pagination.total} total)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchSubscribers(pagination.current - 1)}
                disabled={pagination.current <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => fetchSubscribers(pagination.current + 1)}
                disabled={pagination.current >= pagination.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Subscribers
                </h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResults(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {!importResults ? (
                <div className="space-y-6">
                  <div>
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
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2">CSV Format Requirements:</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• First row should contain column headers</li>
                          <li>• Required: <code className="bg-blue-100 px-1 rounded">email</code> column</li>
                          <li>• Optional preference columns: <code className="bg-blue-100 px-1 rounded">weeklyDigest</code>, <code className="bg-blue-100 px-1 rounded">achievements</code>, <code className="bg-blue-100 px-1 rounded">research</code>, <code className="bg-blue-100 px-1 rounded">events</code>, <code className="bg-blue-100 px-1 rounded">blogs</code>, <code className="bg-blue-100 px-1 rounded">patents</code>, <code className="bg-blue-100 px-1 rounded">industryCollaborations</code></li>
                          <li>• Use <code className="bg-blue-100 px-1 rounded">true</code>/<code className="bg-blue-100 px-1 rounded">false</code>, <code className="bg-blue-100 px-1 rounded">1</code>/<code className="bg-blue-100 px-1 rounded">0</code>, or <code className="bg-blue-100 px-1 rounded">yes</code>/<code className="bg-blue-100 px-1 rounded">no</code> for preference values</li>
                          <li>• <strong>Note:</strong> The <code className="bg-blue-100 px-1 rounded">research</code> column covers both Research & Publications content</li>
                          <li>• Missing preference columns will default to <code className="bg-blue-100 px-1 rounded">true</code> for new subscribers</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">Need a template?</h4>
                      <button
                        onClick={downloadSampleCSV}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Download Sample CSV
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Download our sample CSV file to see the correct format and required columns.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={importSubscribers}
                      disabled={!importFile || actionLoading === 'import'}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                      {actionLoading === 'import' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      Import Subscribers
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{importResults.added}</div>
                        <div className="text-sm text-green-800">Successfully Added</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{importResults.updated}</div>
                        <div className="text-sm text-blue-800">Updated</div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{importResults.skipped}</div>
                        <div className="text-sm text-yellow-800">Skipped</div>
                      </div>
                    </div>
                  </div>
                  
                  {importResults.errors && importResults.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-red-800 mb-2">Errors occurred during import:</h4>
                          <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                            {importResults.errors.slice(0, 10).map((error, index) => (
                              <li key={index}>• {error}</li>
                            ))}
                            {importResults.errors.length > 10 && (
                              <li>• ... and {importResults.errors.length - 10} more errors</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setImportResults(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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