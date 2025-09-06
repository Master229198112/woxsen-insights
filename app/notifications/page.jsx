'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Edit, 
  MessageSquare, 
  Clock, 
  Filter,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

const formatTimeAgo = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now - notificationDate) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return notificationDate.toLocaleDateString();
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'blog_approved':
    case 'blog_published':
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case 'blog_rejected':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'blog_edited':
      return <Edit className="h-5 w-5 text-blue-600" />;
    case 'comment_added':
    case 'comment_reply':
      return <MessageSquare className="h-5 w-5 text-purple-600" />;
    default:
      return <Bell className="h-5 w-5 text-gray-600" />;
  }
};

const getNotificationTypeLabel = (type) => {
  switch (type) {
    case 'blog_approved':
      return 'Blog Approved';
    case 'blog_published':
      return 'Blog Published';
    case 'blog_rejected':
      return 'Blog Rejected';
    case 'blog_edited':
      return 'Blog Edited';
    case 'comment_added':
      return 'New Comment';
    case 'comment_reply':
      return 'Comment Reply';
    default:
      return 'Notification';
  }
};

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedType, setSelectedType] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [actionLoading, setActionLoading] = useState({});

  const notificationTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: 'blog_approved', label: 'Blog Approved' },
    { value: 'blog_published', label: 'Blog Published' },
    { value: 'blog_rejected', label: 'Blog Rejected' },
    { value: 'blog_edited', label: 'Blog Edited' },
    { value: 'comment_added', label: 'New Comments' },
    { value: 'comment_reply', label: 'Comment Replies' }
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchNotifications();
  }, [session, status, filter, selectedType, pagination.page, router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        unreadOnly: filter === 'unread' ? 'true' : 'false'
      });
      
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }
      
      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications);
        setPagination(data.pagination);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds) => {
    try {
      setActionLoading(prev => ({ ...prev, markRead: true }));
      
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, markRead: false }));
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading(prev => ({ ...prev, markAllRead: true }));
      
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, markAllRead: false }));
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }
    
    // Navigate to related content if available
    if (notification.relatedBlog && notification.relatedBlog.slug) {
      router.push(`/blog/${notification.relatedBlog.slug}`);
    } else if (notification.relatedBlog) {
      router.push(`/blog/${notification.relatedBlog._id}`);
    }
  };

  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading notifications...</p>
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your blog activities and interactions
          </p>
        </div>

        {/* Stats and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{pagination.total}</span> total notifications
              {unreadCount > 0 && (
                <span className="ml-2">
                  <span className="font-medium text-blue-600">{unreadCount}</span> unread
                </span>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              disabled={actionLoading.markAllRead}
              size="sm"
              className="flex items-center space-x-2"
            >
              {actionLoading.markAllRead ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <span>Mark All Read</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read
            </Button>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification._id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-blue-200 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-lg font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </span>
                          <Clock className="h-4 w-4" />
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 ${
                        !notification.isRead ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {notification.sender && (
                        <div className="flex items-center text-sm text-gray-500">
                          <span>From: {notification.sender.name}</span>
                        </div>
                      )}
                      
                      {notification.relatedBlog && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-600">
                            Related to: <span className="font-medium">{notification.relatedBlog.title}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {!notification.isRead && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead([notification._id]);
                        }}
                        variant="outline"
                        size="sm"
                        disabled={actionLoading.markRead}
                        className="flex-shrink-0"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.pages} 
              ({pagination.total} total notifications)
            </p>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                {pagination.page}
              </span>
              
              <Button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
