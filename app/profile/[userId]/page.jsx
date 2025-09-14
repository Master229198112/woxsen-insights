'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { 
  FollowButton, 
  FollowStats, 
  FollowersList, 
  FollowSuggestions 
} from '@/components/profile/FollowSystem';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Award, 
  BookOpen, 
  ExternalLink,
  Linkedin,
  Globe,
  Users,
  FileText,
  Eye,
  MessageCircle,
  Share2,
  MoreVertical
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PublicProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const userId = params.userId;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFollowersList, setShowFollowersList] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchRecentPosts();
      fetchAchievements();
      checkFollowStatus();
      incrementProfileView();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else if (response.status === 403) {
        setError('This profile is private');
      } else if (response.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch(`/api/posts?userId=${userId}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setRecentPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/posts?userId=${userId}&category=achievements&limit=3`);
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.data.posts);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!session) return;
    
    try {
      const response = await fetch(`/api/user/follow?action=check-status&userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const incrementProfileView = async () => {
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'increment-view', userId })
      });
    } catch (error) {
      console.error('Error incrementing profile view:', error);
    }
  };

  const handleFollowChange = (newFollowStatus) => {
    setIsFollowing(newFollowStatus);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const renderSocialLinks = () => {
    if (!user?.socialProfiles || !user?.privacySettings?.showSocialProfiles) return null;

    const links = [
      { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
      { key: 'orcid', icon: Award, label: 'ORCID' },
      { key: 'googleScholar', icon: BookOpen, label: 'Google Scholar' },
      { key: 'researchGate', icon: ExternalLink, label: 'ResearchGate' },
      { key: 'website', icon: Globe, label: 'Website' },
      { key: 'twitter', icon: ExternalLink, label: 'Twitter' }
    ];

    const availableLinks = links.filter(link => 
      user.socialProfiles[link.key] && user.socialProfiles[link.key].trim()
    );

    if (availableLinks.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Professional Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.key}
                  href={user.socialProfiles[link.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {link.label}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAchievements = () => {
    if (achievements.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Recent Achievements
            </div>
            <Link 
              href={`/profile/${userId}/achievements`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement._id} className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{achievement.excerpt}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDate(achievement.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRecentActivity = () => {
    if (recentPosts.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Posts
            </div>
            <Link 
              href={`/profile/${userId}/posts`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  {post.featuredImage && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      <h4 className="font-medium truncate">{post.title}</h4>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 capitalize">
                        {post.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Available</h2>
              <p className="text-gray-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-3xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user.academicInfo?.designation ? 
                        `${user.academicInfo.designation} ${user.name}` : 
                        user.name
                      }
                    </h1>
                    
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {user.department}
                      </div>
                      
                      {user.privacySettings?.showEmail && user.email && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Joined {formatDate(user.createdAt)}
                      </div>
                      
                      {user.privacySettings?.showStats && user.profileStats?.profileViews && (
                        <div className="flex items-center text-gray-600">
                          <Eye className="h-4 w-4 mr-2" />
                          {user.profileStats.profileViews} profile views
                        </div>
                      )}
                    </div>

                    {user.bio && (
                      <p className="mt-4 text-gray-700 leading-relaxed">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <FollowButton 
                      userId={userId}
                      initialFollowStatus={isFollowing}
                      onFollowChange={handleFollowChange}
                    />
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                {user.privacySettings?.showStats && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <FollowStats userId={userId} />
                    
                    <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
                      <span><strong className="text-gray-900">{user.profileStats?.totalPosts || 0}</strong> posts</span>
                      <span><strong className="text-gray-900">{user.profileStats?.totalPublications || 0}</strong> publications</span>
                      <span><strong className="text-gray-900">{user.profileStats?.totalAchievements || 0}</strong> achievements</span>
                      <span><strong className="text-gray-900">{user.profileStats?.totalPatents || 0}</strong> patents</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About & Links */}
          <div className="space-y-8">
            {/* Academic Information */}
            {user.academicInfo && (user.academicInfo.researchInterests?.length > 0 || user.academicInfo.qualifications?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.academicInfo.qualifications?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                      <div className="space-y-2">
                        {user.academicInfo.qualifications.map((qual, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{qual.degree} in {qual.field}</div>
                            <div className="text-gray-600">{qual.institution} ({qual.year})</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.academicInfo.researchInterests?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Research Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {user.academicInfo.researchInterests.map((interest, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {renderSocialLinks()}
            
            {/* Achievements */}
            {renderAchievements()}
          </div>

          {/* Right Column - Activity & Posts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            {renderRecentActivity()}
            
            {/* Follow Suggestions */}
            {session && session.user.id !== userId && (
              <FollowSuggestions />
            )}
          </div>
        </div>

        {/* Followers/Following Modal */}
        {showFollowersList && (
          <FollowersList
            userId={userId}
            type={showFollowersList}
            onClose={() => setShowFollowersList(null)}
          />
        )}
      </div>
    </div>
  );
}
