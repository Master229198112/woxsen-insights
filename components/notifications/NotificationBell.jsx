'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useSmartPolling } from '@/hooks/useSmartPolling';
import { 
  Bell, 
  X, 
  CheckCircle, 
  XCircle, 
  Edit, 
  MessageSquare, 
  Clock,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react';

const formatTimeAgo = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now - notificationDate) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'blog_approved':
    case 'blog_published':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'blog_rejected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'blog_edited':
      return <Edit className="h-4 w-4 text-blue-600" />;
    case 'comment_added':
    case 'comment_reply':
      return <MessageSquare className="h-4 w-4 text-purple-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-600" />;
  }
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Optimized fetch with minimal logging
  const fetchNotificationsCallback = useCallback(async () => {
    if (!session) {
      return;
    }
    
    try {
      const response = await fetch('/api/notifications?limit=10');
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        // Only log on errors or when debugging is needed
        if (process.env.NODE_ENV === 'development' && window.DEBUG_NOTIFICATIONS) {
          console.log('🔔 Notifications updated:', data.unreadCount, 'unread');
        }
      } else {
        console.error('🔔 [Error] API Error:', data.error);
      }
    } catch (error) {
      console.error('🔔 [Error] Fetch failed:', error);
    }
  }, [session]);

  // Smart polling with 5-minute intervals (much longer to reduce server load)
  const { isActive, isPolling, forceUpdate, lastPollTime } = useSmartPolling(
    fetchNotificationsCallback, 
    300000, // 5 minutes instead of 2 minutes
    !!session // Only enable if user is logged in
  );

  // Cleanup logging for production
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && window.DEBUG_NOTIFICATIONS) {
      console.log('🔔 [Debug] NotificationBell mounted:', {
        session: !!session,
        isPolling,
        isActive
      });
    }
    
    return () => {
      if (process.env.NODE_ENV === 'development' && window.DEBUG_NOTIFICATIONS) {
        console.log('🔔 [Debug] NotificationBell cleanup');
      }
    };
  }, [session, isPolling, isActive]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const markAsRead = async (notificationIds) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        fetchNotificationsCallback();
      }
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        fetchNotificationsCallback();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead([notification._id]);
    }
    
    // Navigate to related content if available
    if (notification.relatedBlog) {
      window.location.href = `/blog/${notification.relatedBlog.slug || notification.relatedBlog._id}`;
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef} data-component="notification-bell">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {/* Smart polling indicator */}
        {session && (
          <div className="absolute -bottom-1 -right-1">
            {isActive && isPolling ? (
              <Wifi className="h-3 w-3 text-green-500" title="Smart polling active (5min)" />
            ) : (
              <WifiOff className="h-3 w-3 text-gray-400" title="Polling paused (tab inactive)" />
            )}
          </div>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {/* Force refresh button */}
                <Button
                  onClick={() => {
                    console.log('🔔 Manual refresh triggered');
                    forceUpdate();
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-sm text-gray-600 hover:text-gray-700"
                  title="Refresh notifications"
                >
                  <Bell className="h-3 w-3" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    disabled={loading}
                    variant="ghost"
                    size="sm"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {loading ? (
                      <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Mark all read'
                    )}
                  </Button>
                )}
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Smart polling status */}
            {session && (
              <div className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {isActive && isPolling ? (
                    <>
                      <Wifi className="h-3 w-3 text-green-500" />
                      <span>Live updates (5min)</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-gray-400" />
                      <span>Paused (tab inactive)</span>
                    </>
                  )}
                </div>
                {lastPollTime && (
                  <span>• Last: {lastPollTime.toLocaleTimeString()}</span>
                )}
              </div>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <p className={`text-sm ${
                          !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                        } line-clamp-2`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center mt-2">
                          <Clock className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Link href="/notifications">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  View All Notifications
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}