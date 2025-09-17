'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Star,
  Award,
  Calendar,
  User,
  Tag,
  Edit,
  MessageSquare,
  AlertTriangle,
  X,
  Send
} from 'lucide-react';

// Rejection reasons options
const REJECTION_REASONS = [
  'Content quality issues',
  'Inappropriate content',
  'Insufficient research/evidence',
  'Poor writing quality',
  'Duplicate content',
  'Off-topic for platform',
  'Technical issues',
  'Missing required information',
  'Copyright concerns',
  'Other (specify below)'
];

// Category-specific preview components
const AchievementPreview = ({ blog }) => {
  const data = blog.achievementData || {};
  
  return (
    <div className="space-y-6">
      {/* Basic Achievement Info */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">
          {data.achievementType?.toUpperCase() || 'Achievement'}
        </h3>
        <p className="text-purple-700">{data.achievementName || 'Achievement Name Not Provided'}</p>
        {data.awardingOrganization && (
          <p className="text-sm text-purple-600 mt-1">
            Awarded by: <strong>{data.awardingOrganization}</strong>
          </p>
        )}
      </div>

      {/* Key Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.receivedDate && (
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">
              Received: {new Date(data.receivedDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {data.level && (
          <div className="flex items-center">
            <Award className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">Level: {data.level}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {data.achievementDescription && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{data.achievementDescription}</p>
        </div>
      )}

      {/* Monetary Value */}
      {data.monetaryValue?.amount && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Monetary Value</h4>
          <p className="text-green-700">
            {data.monetaryValue.currency} {data.monetaryValue.amount.toLocaleString()}
          </p>
        </div>
      )}

      {/* Team Members */}
      {data.teamMembers && data.teamMembers.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Team Members</h4>
          <div className="space-y-2">
            {data.teamMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{member.name}</span>
                {member.isMainContributor && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Lead</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PatentPreview = ({ blog }) => {
  const data = blog.patentData || {};
  
  return (
    <div className="space-y-6">
      {/* Patent Basic Info */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          {data.patentType?.toUpperCase() || 'Patent'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {data.patentNumber && (
            <p className="text-yellow-700">
              <strong>Patent No:</strong> {data.patentNumber}
            </p>
          )}
          {data.applicationNumber && (
            <p className="text-yellow-700">
              <strong>Application No:</strong> {data.applicationNumber}
            </p>
          )}
          {data.status && (
            <p className="text-yellow-700">
              <strong>Status:</strong> {data.status}
            </p>
          )}
          {data.patentOffice && (
            <p className="text-yellow-700">
              <strong>Office:</strong> {data.patentOffice}
            </p>
          )}
        </div>
      </div>

      {/* Important Dates */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Important Dates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {data.filingDate && (
            <p><strong>Filed:</strong> {new Date(data.filingDate).toLocaleDateString()}</p>
          )}
          {data.grantDate && (
            <p><strong>Granted:</strong> {new Date(data.grantDate).toLocaleDateString()}</p>
          )}
          {data.publicationDate && (
            <p><strong>Published:</strong> {new Date(data.publicationDate).toLocaleDateString()}</p>
          )}
          {data.expiryDate && (
            <p><strong>Expires:</strong> {new Date(data.expiryDate).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Technical Description */}
      {(data.technicalField || data.summary) && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Technical Description</h4>
          {data.technicalField && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700">Technical Field:</h5>
              <p className="text-gray-600 text-sm">{data.technicalField}</p>
            </div>
          )}
          {data.summary && (
            <div>
              <h5 className="text-sm font-medium text-gray-700">Summary:</h5>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{data.summary}</p>
            </div>
          )}
        </div>
      )}

      {/* Inventors */}
      {data.inventors && data.inventors.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Inventors</h4>
          <div className="space-y-2">
            {data.inventors.map((inventor, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{inventor.name}</span>
                  {inventor.affiliation && (
                    <span className="text-sm text-gray-500 ml-2">({inventor.affiliation})</span>
                  )}
                </div>
                {inventor.isPrimary && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Primary</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignee */}
      {data.assignee?.name && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Assignee</h4>
          <p className="text-blue-700">
            <strong>{data.assignee.name}</strong> ({data.assignee.type})
          </p>
        </div>
      )}
    </div>
  );
};

const EventPreview = ({ blog }) => {
  const data = blog.eventData || {};
  
  return (
    <div className="space-y-6">
      {/* Event Basic Info */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          {data.eventType?.toUpperCase() || 'Event'} - {data.eventFormat?.toUpperCase()}
        </h3>
        <p className="text-red-700">{data.eventName || 'Event Name Not Provided'}</p>
      </div>

      {/* Date and Time */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Date & Time</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {data.startDate && (
            <p><strong>Start:</strong> {new Date(data.startDate).toLocaleDateString()}</p>
          )}
          {data.endDate && (
            <p><strong>End:</strong> {new Date(data.endDate).toLocaleDateString()}</p>
          )}
          {data.startTime && (
            <p><strong>Time:</strong> {data.startTime} - {data.endTime}</p>
          )}
          {data.timezone && (
            <p><strong>Timezone:</strong> {data.timezone}</p>
          )}
        </div>
      </div>

      {/* Location */}
      {(data.location?.venue || data.location?.virtualLink) && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Location</h4>
          {data.location.venue && (
            <div className="mb-2">
              <p><strong>Venue:</strong> {data.location.venue}</p>
              {data.location.building && (
                <p className="text-sm text-gray-600">Building: {data.location.building}</p>
              )}
              {data.location.room && (
                <p className="text-sm text-gray-600">Room: {data.location.room}</p>
              )}
            </div>
          )}
          {data.location.virtualLink && (
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-sm"><strong>Virtual Link:</strong> 
                <a href={data.location.virtualLink} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline ml-1">
                  Join Meeting
                </a>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Organizer */}
      {data.organizer?.primaryOrganizer?.name && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Organizer</h4>
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>{data.organizer.primaryOrganizer.name}</strong></p>
            {data.organizer.primaryOrganizer.email && (
              <p className="text-sm text-gray-600">{data.organizer.primaryOrganizer.email}</p>
            )}
            {data.organizer.organizingInstitution && (
              <p className="text-sm text-gray-600">{data.organizer.organizingInstitution}</p>
            )}
          </div>
        </div>
      )}

      {/* Speakers */}
      {data.speakers && data.speakers.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Speakers</h4>
          <div className="space-y-2">
            {data.speakers.map((speaker, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{speaker.name}</p>
                    {speaker.designation && (
                      <p className="text-sm text-gray-600">{speaker.designation}</p>
                    )}
                    {speaker.affiliation && (
                      <p className="text-sm text-gray-500">{speaker.affiliation}</p>
                    )}
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {speaker.speakerType}
                  </span>
                </div>
                {speaker.topicTitle && (
                  <p className="text-sm text-gray-700 mt-1">
                    <strong>Topic:</strong> {speaker.topicTitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration */}
      {data.registration?.isRegistrationRequired && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Registration Required</h4>
          <div className="text-sm text-green-700">
            {data.registration.registrationFee?.amount && (
              <p><strong>Fee:</strong> {data.registration.registrationFee.currency} {data.registration.registrationFee.amount}</p>
            )}
            {data.registration.maxParticipants && (
              <p><strong>Max Participants:</strong> {data.registration.maxParticipants}</p>
            )}
            {data.registration.registrationDeadline && (
              <p><strong>Deadline:</strong> {new Date(data.registration.registrationDeadline).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ResearchPreview = ({ blog }) => {
  const data = blog.researchData || {};
  
  return (
    <div className="space-y-6">
      {/* Research Basic Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          {data.paperType?.toUpperCase() || 'Research Paper'}
        </h3>
        <div className="text-sm text-blue-700">
          {data.journal && (
            <p><strong>Published in:</strong> {data.journal}</p>
          )}
          {data.publishedYear && (
            <p><strong>Year:</strong> {data.publishedYear}</p>
          )}
          {data.doi && (
            <p><strong>DOI:</strong> {data.doi}</p>
          )}
        </div>
      </div>

      {/* Abstract */}
      {data.abstract && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Abstract</h4>
          <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
            {data.abstract}
          </p>
        </div>
      )}

      {/* Publication Details */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Publication Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {data.volume && (
            <p><strong>Volume:</strong> {data.volume}</p>
          )}
          {data.issue && (
            <p><strong>Issue:</strong> {data.issue}</p>
          )}
          {data.pages && (
            <p><strong>Pages:</strong> {data.pages}</p>
          )}
          {data.researchType && (
            <p><strong>Type:</strong> {data.researchType}</p>
          )}
        </div>
      </div>

      {/* Indexing Information */}
      {data.indexedIn && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Indexing & Impact</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {data.indexedIn.scopus && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                Scopus Indexed
              </span>
            )}
            {data.indexedIn.wos && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                Web of Science
              </span>
            )}
            {data.indexedIn.quartile && data.indexedIn.quartile !== 'Not Indexed' && (
              <p><strong>Quartile:</strong> {data.indexedIn.quartile}</p>
            )}
            {data.indexedIn.impactFactor && (
              <p><strong>Impact Factor:</strong> {data.indexedIn.impactFactor}</p>
            )}
            {data.indexedIn.citations > 0 && (
              <p><strong>Citations:</strong> {data.indexedIn.citations}</p>
            )}
          </div>
        </div>
      )}

      {/* Co-Authors */}
      {data.coAuthors && data.coAuthors.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Co-Authors</h4>
          <div className="space-y-2">
            {data.coAuthors.map((author, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{author.name}</span>
                  {author.affiliation && (
                    <span className="text-sm text-gray-500 ml-2">({author.affiliation})</span>
                  )}
                </div>
                {author.isCorresponding && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Corresponding</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keywords */}
      {data.keywords && data.keywords.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Keywords</h4>
          <div className="flex flex-wrap gap-1">
            {data.keywords.map((keyword, index) => (
              <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Funding */}
      {data.fundingSource && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Funding</h4>
          <p className="text-green-700">{data.fundingSource}</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Blog Preview Modal Component
const BlogPreviewModal = ({ blog, isOpen, onClose, onApprove, onReject, loading }) => {
  if (!isOpen || !blog) return null;

  // Determine which preview component to render based on category
  const renderCategoryPreview = () => {
    switch (blog.category) {
      case 'achievements':
        return <AchievementPreview blog={blog} />;
      case 'patents':
        return <PatentPreview blog={blog} />;
      case 'events':
        return <EventPreview blog={blog} />;
      case 'research':
        return <ResearchPreview blog={blog} />;
      default:
        // Traditional blog content for other categories
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {blog.content}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {blog.category === 'achievements' && 'Achievement Preview'}
            {blog.category === 'patents' && 'Patent Preview'}
            {blog.category === 'events' && 'Event Preview'}
            {blog.category === 'research' && 'Research Preview'}
            {!['achievements', 'patents', 'events', 'research'].includes(blog.category) && 'Blog Preview'}
          </h2>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => onApprove(blog._id)}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => onReject(blog._id)}
              disabled={loading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {/* Blog Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {blog.author.name} • {blog.author.department}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(blog.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  {blog.category}
                </div>
              </div>
              
              {/* Show excerpt for traditional blogs */}
              {blog.excerpt && !['achievements', 'patents', 'events', 'research'].includes(blog.category) && (
                <p className="text-lg text-gray-600 mb-6">{blog.excerpt}</p>
              )}
              
              {blog.featuredImage && (
                <div className="mb-6">
                  <Image
                    src={blog.featuredImage}
                    alt={blog.title}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
            
            {/* Category-specific content */}
            {renderCategoryPreview()}
            
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span key={index} className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Rejection Modal Component
const RejectionModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) {
      alert('Please select a rejection reason');
      return;
    }
    
    if (selectedReason === 'Other (specify below)' && !customReason.trim()) {
      alert('Please provide a custom reason');
      return;
    }
    
    onSubmit(selectedReason, customReason);
    setSelectedReason('');
    setCustomReason('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Reject Blog</h2>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a reason</option>
              {REJECTION_REASONS.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>
          
          {selectedReason === 'Other (specify below)' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Reason *
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide specific feedback..."
              />
            </div>
          )}
          
          {selectedReason && selectedReason !== 'Other (specify below)' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments (Optional)
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full h-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Any additional feedback for the author..."
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Reject Blog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EnhancedAdminBlogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, published: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState({});
  const [previewBlog, setPreviewBlog] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentBlogForRejection, setCurrentBlogForRejection] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchBlogs();
  }, [session, status, filter, router]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/blogs?status=${filter}`);
      const data = await response.json();
      
      if (response.ok) {
        setBlogs(data.blogs);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error('Fetch blogs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogAction = async (blogId, status, options = {}) => {
    try {
      setActionLoading(prev => ({ ...prev, [blogId]: true }));
      
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status, 
          ...options 
        }),
      });

      if (response.ok) {
        fetchBlogs();
        setShowPreview(false);
        setShowRejectionModal(false);
        alert(`Blog ${status} successfully!`);
      } else {
        const data = await response.json();
        alert(data.error || `Failed to ${status} blog`);
      }
    } catch (error) {
      console.error('Blog action error:', error);
      alert(`Failed to ${status} blog`);
    } finally {
      setActionLoading(prev => ({ ...prev, [blogId]: false }));
    }
  };

  const handlePreview = async (blogId) => {
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}/preview`);
      const data = await response.json();
      
      if (response.ok) {
        setPreviewBlog(data.blog);
        setShowPreview(true);
      } else {
        alert(data.error || 'Failed to load blog preview');
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Failed to load blog preview');
    }
  };

  const handleRejectClick = (blogId) => {
    setCurrentBlogForRejection(blogId);
    setShowRejectionModal(true);
  };

  const handleRejectSubmit = (reason, customReason) => {
    if (currentBlogForRejection) {
      handleBlogAction(currentBlogForRejection, 'rejected', {
        rejectionReason: reason,
        customRejectionReason: customReason
      });
    }
  };

  const handleEditBlog = (blogId) => {
    router.push(`/dashboard/edit/${blogId}`);
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Blog Management</h1>
          <p className="text-gray-600">Review, edit, and manage blog submissions with enhanced features</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Blogs</p>
                  <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending ({counts.pending})
          </Button>
          <Button
            variant={filter === 'published' ? 'default' : 'outline'}
            onClick={() => setFilter('published')}
          >
            Published ({counts.published})
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All ({counts.total})
          </Button>
        </div>

        {/* Blogs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No blogs found for this filter</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {blogs.map((blog) => (
              <Card key={blog._id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-6">
                    {/* Featured Image */}
                    <div className="flex-shrink-0 w-32 h-24 relative rounded-lg overflow-hidden">
                      <Image
                        src={blog.featuredImage}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                              {blog.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              blog.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              blog.status === 'published' ? 'bg-green-100 text-green-800' :
                              blog.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {blog.excerpt}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {blog.author.name}
                            </div>
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              {blog.category}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {blog.views} views
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          {/* Preview and Edit buttons */}
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreview(blog._id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Preview
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBlog(blog._id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                          
                          {/* Status-specific actions */}
                          {blog.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleBlogAction(blog._id, 'published')}
                                disabled={actionLoading[blog._id]}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {actionLoading[blog._id] ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Publish
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectClick(blog._id)}
                                disabled={actionLoading[blog._id]}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          
                          {blog.status === 'published' && (
                            <div className="flex items-center space-x-2 text-sm">
                              {blog.isHeroPost && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                                  <Star className="h-3 w-3 mr-1" />
                                  Hero
                                </span>
                              )}
                              {blog.isFeatured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  <Award className="h-3 w-3 mr-1" />
                                  Featured
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Tags */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{blog.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Rejection History */}
                      {blog.rejectionHistory && blog.rejectionHistory.length > 0 && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                            <span className="text-sm font-medium text-red-800">Previous Rejections</span>
                          </div>
                          <div className="text-sm text-red-700">
                            Latest: {blog.rejectionHistory[blog.rejectionHistory.length - 1].reason}
                            {blog.rejectionHistory[blog.rejectionHistory.length - 1].customReason && (
                              <div className="mt-1 text-red-600">
                                {blog.rejectionHistory[blog.rejectionHistory.length - 1].customReason}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Blog Preview Modal */}
      <BlogPreviewModal
        blog={previewBlog}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onApprove={(blogId) => handleBlogAction(blogId, 'published')}
        onReject={(blogId) => handleRejectClick(blogId)}
        loading={actionLoading[previewBlog?._id]}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          setCurrentBlogForRejection(null);
        }}
        onSubmit={handleRejectSubmit}
        loading={actionLoading[currentBlogForRejection]}
      />
    </div>
  );
}
