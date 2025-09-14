'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  UserPlus, 
  UserMinus, 
  Users, 
  Heart, 
  MessageCircle,
  UserCheck,
  UserX,
  Loader2,
  Eye,
  Settings,
  Bell,
  BellOff
} from 'lucide-react';
import Image from 'next/image';

const FollowButton = ({ 
  userId, 
  initialFollowStatus = false, 
  size = 'default',
  variant = 'default',
  showText = true,
  onFollowChange 
}) => {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(initialFollowStatus);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Don't show follow button for own profile
  if (!session || session.user.id === userId) {
    return null;
  }

  const handleFollowToggle = async () => {
    setLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow
        const response = await fetch(`/api/user/follow?userId=${userId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setIsFollowing(false);
          if (onFollowChange) onFollowChange(false);
        }
      } else {
        // Follow
        const response = await fetch('/api/user/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, source: 'profile-page' })
        });
        
        if (response.ok) {
          setIsFollowing(true);
          if (onFollowChange) onFollowChange(true);
        }
      }
    } catch (error) {
      console.error('Follow operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && <span className="ml-2">Loading...</span>}
        </>
      );
    }

    if (isFollowing) {
      return (
        <>
          {hovered ? (
            <>
              <UserX className="h-4 w-4" />
              {showText && <span className="ml-2">Unfollow</span>}
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              {showText && <span className="ml-2">Following</span>}
            </>
          )}
        </>
      );
    } else {
      return (
        <>
          <UserPlus className="h-4 w-4" />
          {showText && <span className="ml-2">Follow</span>}
        </>
      );
    }
  };

  return (
    <Button
      variant={isFollowing ? (hovered ? 'destructive' : 'outline') : variant}
      size={size}
      onClick={handleFollowToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={loading}
      className={`flex items-center ${isFollowing && hovered ? 'hover:bg-red-600' : ''}`}
    >
      {getButtonContent()}
    </Button>
  );
};

const FollowStats = ({ userId, className = '' }) => {
  const [stats, setStats] = useState({ totalFollowers: 0, totalFollowing: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/user/follow?action=stats&userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching follow stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className={`flex space-x-4 ${className}`}>
        <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
        <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
      </div>
    );
  }

  return (
    <div className={`flex space-x-6 text-sm text-gray-600 ${className}`}>
      <span className="flex items-center">
        <Users className="h-4 w-4 mr-1" />
        <strong className="text-gray-900">{stats.totalFollowers}</strong> followers
      </span>
      <span className="flex items-center">
        <strong className="text-gray-900">{stats.totalFollowing}</strong> following
      </span>
    </div>
  );
};

const FollowersList = ({ userId, type = 'followers', onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/user/follow?action=${type}&userId=${userId}&page=${page}&limit=20`);
        if (response.ok) {
          const data = await response.json();
          setUsers(page === 1 ? data[type] : [...users, ...data[type]]);
          setPagination(data.pagination);
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type, page]);

  const loadMore = () => {
    if (pagination.hasNext) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-96 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="capitalize">{type}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-80 overflow-y-auto">
          {loading && page === 1 ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div key={user._id || index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">
                        {user.academicInfo?.designation && (
                          <span>{user.academicInfo.designation} • </span>
                        )}
                        {user.department}
                      </div>
                    </div>
                  </div>
                  <FollowButton userId={user._id} size="sm" showText={false} />
                </div>
              ))}
              
              {pagination.hasNext && (
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const FollowSuggestions = ({ className = '' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch('/api/user/follow?action=suggestions');
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Suggested Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.slice(0, 5).map((user, index) => (
            <div key={user._id || index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">
                    {user.department}
                    {user.mutualCount > 0 && (
                      <span className="text-blue-600"> • {user.mutualCount} mutual</span>
                    )}
                  </div>
                </div>
              </div>
              <FollowButton 
                userId={user._id} 
                size="sm" 
                onFollowChange={() => {
                  // Remove from suggestions when followed
                  setSuggestions(prev => prev.filter(s => s._id !== user._id));
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const FollowNotificationSettings = ({ userId, onClose }) => {
  const [settings, setSettings] = useState({
    newPosts: true,
    achievements: true,
    publications: true,
    patents: false,
    events: false
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/follow', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'update-notifications',
          notificationSettings: settings
        })
      });

      if (response.ok) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                <p className="text-sm text-gray-500">
                  Get notified about {key.toLowerCase()}
                </p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                className="w-4 h-4"
              />
            </div>
          ))}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Export all components
export {
  FollowButton,
  FollowStats,
  FollowersList,
  FollowSuggestions,
  FollowNotificationSettings
};
