'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Eye, 
  BookOpen,
  User,
  MapPin,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Twitter,
  ExternalLink,
  Award,
  GraduationCap,
  Mail,
  Building,
  Share2,
  Copy,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const EnhancedAuthorProfile = ({ author, posts, stats, postsByCategory, pagination, currentPage }) => {
  const [collapsedSections, setCollapsedSections] = useState({
    academic: false,
    social: false,
    experience: false
  });
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleShare = async (platform) => {
    const currentUrl = window.location.href;
    const title = `${author.name} - Professional Profile`;
    
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(currentUrl);
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
          console.error('Failed to copy link:', err);
        }
        break;
    }
    setShareMenuOpen(false);
  };

  const handleContact = () => {
    if (author.email) {
      window.location.href = `mailto:${author.email}?subject=Hello ${author.name}`;
    } else if (author.socialProfiles?.linkedin) {
      window.open(author.socialProfiles.linkedin, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Navigation */}
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Enhanced Author Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
          {/* Author Avatar */}
          <div className="flex-shrink-0 mx-auto lg:mx-0">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl font-bold text-white">
                {author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* Author Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {author.name}
            </h1>
            
            <div className="flex items-center justify-center lg:justify-start text-lg text-gray-600 mb-4">
              <MapPin className="h-5 w-5 mr-2" />
              {author.department}
            </div>
            
            {/* Enhanced Bio Section */}
            {author.bio && (
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-base md:text-lg max-w-3xl">
                  {author.bio}
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                Member since {formatDate(stats.memberSince)}
              </div>
            </div>

            {/* Contact and Share Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Contact Button */}
              {(author.email || author.socialProfiles?.linkedin) && (
                <Button 
                  onClick={handleContact}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact
                </Button>
              )}

              {/* Share Button */}
              <div className="relative">
                <Button 
                  variant="outline"
                  onClick={() => setShareMenuOpen(!shareMenuOpen)}
                  className="w-full sm:w-auto px-6 py-2 rounded-lg"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Profile
                </Button>
                
                {shareMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 w-48">
                    <button
                      onClick={() => handleShare('linkedin')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                    >
                      <Linkedin className="h-4 w-4 mr-2" />
                      Share on LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copySuccess ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Information & Social Profiles - Responsive and Collapsible */}
      {(author.academicInfo?.designation || author.academicInfo?.qualifications?.length > 0 || 
        author.academicInfo?.researchInterests?.length > 0 || 
        Object.values(author.socialProfiles || {}).some(link => link)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Academic Information */}
          {(author.academicInfo?.designation || author.academicInfo?.qualifications?.length > 0 || 
            author.academicInfo?.researchInterests?.length > 0) && (
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Academic Information
                  </div>
                  <button
                    onClick={() => toggleSection('academic')}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    {collapsedSections.academic ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronUp className="h-4 w-4" />
                    }
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 transition-all duration-300 ${
                collapsedSections.academic ? 'lg:block hidden' : 'block'
              }`}>
                {author.academicInfo?.designation && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Current Position</h4>
                    <p className="text-gray-700">{author.academicInfo.designation}</p>
                  </div>
                )}
                
                {author.academicInfo?.qualifications?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                    <div className="space-y-2">
                      {author.academicInfo.qualifications.map((qual, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{qual.degree}</span>
                          {qual.field && <span className="text-gray-600"> in {qual.field}</span>}
                          {qual.institution && <span className="text-gray-600"> from {qual.institution}</span>}
                          {qual.year && <span className="text-gray-500"> ({qual.year})</span>}
                          {qual.isHighestDegree && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Highest</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {author.academicInfo?.researchInterests?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Research Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {author.academicInfo.researchInterests.map((interest, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded transition-colors hover:bg-gray-200">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Social Profiles */}
          {Object.values(author.socialProfiles || {}).some(link => link) && (
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Connect & Follow
                  </div>
                  <button
                    onClick={() => toggleSection('social')}
                    className="lg:hidden p-1 hover:bg-gray-100 rounded"
                  >
                    {collapsedSections.social ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronUp className="h-4 w-4" />
                    }
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent className={`transition-all duration-300 ${
                collapsedSections.social ? 'lg:block hidden' : 'block'
              }`}>
                <div className="space-y-3">
                  {author.email && (
                    <a 
                      href={`mailto:${author.email}`}
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-colors p-2 rounded hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4 mr-3" />
                      <span className="text-sm">{author.email}</span>
                    </a>
                  )}
                  
                  {author.socialProfiles?.linkedin && (
                    <a 
                      href={author.socialProfiles.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-colors p-2 rounded hover:bg-blue-50"
                    >
                      <Linkedin className="h-4 w-4 mr-3" />
                      <span className="text-sm">LinkedIn Profile</span>
                    </a>
                  )}
                  
                  {author.socialProfiles?.orcid && (
                    <a 
                      href={author.socialProfiles.orcid}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-green-600 transition-colors p-2 rounded hover:bg-green-50"
                    >
                      <Award className="h-4 w-4 mr-3" />
                      <span className="text-sm">ORCID</span>
                    </a>
                  )}
                  
                  {author.socialProfiles?.googleScholar && (
                    <a 
                      href={author.socialProfiles.googleScholar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-blue-600 transition-colors p-2 rounded hover:bg-blue-50"
                    >
                      <BookOpen className="h-4 w-4 mr-3" />
                      <span className="text-sm">Google Scholar</span>
                    </a>
                  )}
                  
                  {author.socialProfiles?.researchGate && (
                    <a 
                      href={author.socialProfiles.researchGate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-teal-600 transition-colors p-2 rounded hover:bg-teal-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-3" />
                      <span className="text-sm">ResearchGate</span>
                    </a>
                  )}
                  
                  {author.socialProfiles?.website && (
                    <a 
                      href={author.socialProfiles.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-purple-600 transition-colors p-2 rounded hover:bg-purple-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-3" />
                      <span className="text-sm">Personal Website</span>
                    </a>
                  )}
                  
                  {author.socialProfiles?.twitter && (
                    <a 
                      href={author.socialProfiles.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-blue-400 transition-colors p-2 rounded hover:bg-blue-50"
                    >
                      <Twitter className="h-4 w-4 mr-3" />
                      <span className="text-sm">Twitter/X</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Enhanced Professional Experience with Hover Effects and Responsive Timeline */}
      {author.affiliations?.length > 0 && (
        <Card className="mb-8 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Professional Experience
              </div>
              <button
                onClick={() => toggleSection('experience')}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                {collapsedSections.experience ? 
                  <ChevronDown className="h-4 w-4" /> : 
                  <ChevronUp className="h-4 w-4" />
                }
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className={`transition-all duration-300 ${
            collapsedSections.experience ? 'lg:block hidden' : 'block'
          }`}>
            <div className="space-y-6">
              {author.affiliations.map((affiliation, index) => (
                <div 
                  key={index} 
                  className="group relative border-l-2 border-blue-200 pl-6 md:pl-8 hover:border-blue-400 transition-all duration-300 hover:bg-gray-50 p-4 rounded-r-lg -ml-4"
                >
                  {/* Enhanced Timeline Dot */}
                  <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-2 top-6 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300 shadow-md"></div>
                  
                  {/* Mobile-Responsive Content */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg md:text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {affiliation.position}
                    </h3>
                    <p className="font-medium text-blue-600 group-hover:text-blue-700 transition-colors text-base md:text-lg">
                      {affiliation.organization}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 space-y-1 sm:space-y-0">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {affiliation.startDate && new Date(affiliation.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {' - '}
                          {affiliation.isCurrent 
                            ? 'Present' 
                            : (affiliation.endDate && new Date(affiliation.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
                          }
                        </span>
                      </div>
                      {affiliation.isCurrent && (
                        <span className="ml-0 sm:ml-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded group-hover:bg-green-200 transition-colors">
                          Current
                        </span>
                      )}
                    </div>
                    {affiliation.description && (
                      <p className="text-gray-700 text-sm mt-3 leading-relaxed">
                        {affiliation.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Author Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg mx-auto mb-3 md:mb-4">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats.totalPosts}</div>
            <div className="text-xs md:text-sm text-gray-600">Published Posts</div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg mx-auto mb-3 md:mb-4">
              <Eye className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats.totalViews.toLocaleString()}</div>
            <div className="text-xs md:text-sm text-gray-600">Total Views</div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg mx-auto mb-3 md:mb-4">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats.categoriesWritten}</div>
            <div className="text-xs md:text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg mx-auto mb-3 md:mb-4">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              {stats.totalPosts > 0 ? Math.round(stats.totalViews / stats.totalPosts) : 0}
            </div>
            <div className="text-xs md:text-sm text-gray-600">Avg. Views/Post</div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Section - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Main Content - Posts */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Published Posts ({stats.totalPosts})
            </h2>
          </div>

          {posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600">
                  {author.name} hasn't published any posts yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Posts Grid - Responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {posts.map((post) => (
                  <Card key={post._id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-105">
                    <Link href={`/blog/${post.slug || post._id}`}>
                      <div className="relative h-48">
                        <Image
                          src={post.featuredImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </div>
                      <CardContent className="p-6">
                        <div className="mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded group-hover:bg-blue-200 transition-colors">
                            {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(post.publishedAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{post.views} views</span>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>

              {/* Pagination - Responsive */}
              {pagination.total > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link 
                    href={`?page=${currentPage - 1}`}
                    className={currentPage === 1 ? 'pointer-events-none' : ''}
                  >
                    <Button
                      variant="outline"
                      disabled={!pagination.hasPrev}
                      className="flex items-center w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                  </Link>
                  
                  <div className="flex items-center space-x-1 overflow-x-auto">
                    {[...Array(Math.min(5, pagination.total))].map((_, index) => {
                      let pageNum;
                      if (pagination.total <= 5) {
                        pageNum = index + 1;
                      } else if (currentPage <= 3) {
                        pageNum = index + 1;
                      } else if (currentPage >= pagination.total - 2) {
                        pageNum = pagination.total - 4 + index;
                      } else {
                        pageNum = currentPage - 2 + index;
                      }
                      
                      return (
                        <Link key={pageNum} href={`?page=${pageNum}`}>
                          <Button
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                  
                  <Link 
                    href={`?page=${currentPage + 1}`}
                    className={currentPage === pagination.total ? 'pointer-events-none' : ''}
                  >
                    <Button
                      variant="outline"
                      disabled={!pagination.hasNext}
                      className="flex items-center w-full sm:w-auto"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar - Categories - Responsive */}
        <div className="lg:col-span-1">
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Writing Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {postsByCategory.length === 0 ? (
                <p className="text-gray-500 text-sm">No posts yet</p>
              ) : (
                <div className="space-y-3">
                  {postsByCategory.map((category) => (
                    <div key={category._id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
                      <span className="text-gray-700 capitalize">
                        {category._id.replace('-', ' ')}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                        {category.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAuthorProfile;