'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import SmartImage from '@/components/ui/SmartImage';
import BlogContent from '@/components/blog/BlogContent';
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
  Send,
  Trash2,
  AlertCircle,
  Filter,
  ChevronDown
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

// Department mapping for display names and filtering
const DEPARTMENT_OPTIONS = [
  { value: 'all', label: 'All Departments' },
  { value: 'AI Research Centre', label: 'AI Research Centre' },
  { value: 'School of Business', label: 'School of Business' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Operations Management', label: 'Operations Management' },
  { value: 'International Business', label: 'International Business' },
  { value: 'Entrepreneurship', label: 'Entrepreneurship' },
  { value: 'Data Analytics', label: 'Data Analytics' },
  { value: 'Digital Marketing', label: 'Digital Marketing' },
  { value: 'Supply Chain Management', label: 'Supply Chain Management' }
];

// Function to get department badge color
const getDepartmentBadgeClass = (department) => {
  const colorMap = {
    'AI Research Centre': 'bg-blue-100 text-blue-800',
    'Marketing': 'bg-red-100 text-red-800',
    'Digital Marketing': 'bg-red-100 text-red-800',
    'Finance': 'bg-green-100 text-green-800',
    'Human Resources': 'bg-yellow-100 text-yellow-800',
    'Operations Management': 'bg-purple-100 text-purple-800',
    'Supply Chain Management': 'bg-purple-100 text-purple-800',
    'International Business': 'bg-cyan-100 text-cyan-800',
    'Business Administration': 'bg-cyan-100 text-cyan-800',
    'School of Business': 'bg-cyan-100 text-cyan-800',
    'Entrepreneurship': 'bg-orange-100 text-orange-800',
    'Data Analytics': 'bg-emerald-100 text-emerald-800'
  };
  
  return colorMap[department] || 'bg-gray-100 text-gray-800';
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, loading, blogTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Delete Blog</h2>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete this blog?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg border">
              <p className="font-medium text-gray-900 line-clamp-2">
                "{blogTitle}"
              </p>
            </div>
            <p className="text-sm text-red-600 mt-3">
              ⚠️ This action cannot be undone. The blog will be permanently deleted and the author will be notified.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Blog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog Preview Modal Component
const BlogPreviewModal = ({ blog, isOpen, onClose, onApprove, onReject, onDelete, loading }) => {
  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Blog Preview</h2>
          <div className="flex items-center space-x-3">
            {blog.status === 'pending' && (
              <>
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
              </>
            )}
            
            {/* Show delete button for all statuses */}
            <Button
              onClick={() => onDelete(blog._id, blog.title)}
              disabled={loading}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
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
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50">
          <article className="p-8 bg-gray-50">
            {/* Blog Header - Same as actual blog page */}
            <header className="mb-8">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                  {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {blog.excerpt}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium text-gray-700">{blog.author.name}</span>
                  <span className="mx-2">•</span>
                  <span>{blog.author.department}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  <span>{blog.views} views</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{Math.ceil(blog.content.split(' ').length / 200)} min read</span>
                </div>
              </div>

              {/* Featured Image with SmartImage */}
              {blog.featuredImage && (
                <div className="mb-8">
                  <SmartImage
                    src={blog.featuredImage}
                    alt={blog.title}
                    naturalSize={true}
                    className="w-full"
                  />
                </div>
              )}
            </header>

            {/* Blog Content - Properly rendered HTML with same styling as actual blog */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <BlogContent content={blog.content} />
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full flex-shrink-0">
                  <span className="text-xl font-bold text-blue-600">
                    {blog.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {blog.author.name}
                  </h3>
                  <p className="text-gray-600 mb-2">{blog.author.department}</p>
                  <p className="text-sm text-gray-500">
                    Contributor at Woxsen University School of Business
                  </p>
                </div>
              </div>
            </div>
          </article>
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

export default function AdminBlogs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, published: 0, total: 0 });
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [actionLoading, setActionLoading] = useState({});
  const [previewBlog, setPreviewBlog] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentBlogForRejection, setCurrentBlogForRejection] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentBlogForDeletion, setCurrentBlogForDeletion] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchBlogs();
  }, [session, status, filter, router]);

  useEffect(() => {
    filterBlogsByDepartment();
  }, [blogs, departmentFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/blogs?status=${filter}`);
      const data = await response.json();
      
      if (response.ok) {
        setBlogs(data.blogs);
        setCounts(data.counts);
        updateAvailableDepartments(data.blogs);
        updateDepartmentCounts(data.blogs);
      }
    } catch (error) {
      console.error('Fetch blogs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailableDepartments = (blogs) => {
    const departments = new Set();
    blogs.forEach(blog => {
      if (blog.author?.department) {
        departments.add(blog.author.department);
      }
    });
    setAvailableDepartments(Array.from(departments));
  };

  const updateDepartmentCounts = (blogs) => {
    const deptCounts = {};
    blogs.forEach(blog => {
      const dept = blog.author?.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    setDepartmentCounts(deptCounts);
  };

  const filterBlogsByDepartment = () => {
    if (departmentFilter === 'all') {
      setFilteredBlogs(blogs);
    } else {
      const filtered = blogs.filter(blog => 
        blog.author?.department === departmentFilter
      );
      setFilteredBlogs(filtered);
    }
  };

  const getFilteredCounts = () => {
    if (departmentFilter === 'all') {
      return counts;
    }

    const filtered = {
      pending: 0,
      published: 0,
      total: 0
    };

    // We need to fetch all blogs to get accurate counts per department
    // For now, we'll use the current visible blogs as an approximation
    filteredBlogs.forEach(blog => {
      filtered.total++;
      if (blog.status === 'pending') filtered.pending++;
      if (blog.status === 'published') filtered.published++;
    });

    return filtered;
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

  const handleDeleteBlog = async (blogId) => {
    try {
      setActionLoading(prev => ({ ...prev, [blogId]: true }));
      
      const response = await fetch(`/api/admin/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        fetchBlogs();
        setShowDeleteModal(false);
        setCurrentBlogForDeletion(null);
        setShowPreview(false);
        alert(`Blog "${data.deletedBlog.title}" deleted successfully!`);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete blog');
      }
    } catch (error) {
      console.error('Delete blog error:', error);
      alert('Failed to delete blog');
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
    setShowPreview(false);
  };

  const handleDeleteClick = (blogId, blogTitle) => {
    setCurrentBlogForDeletion({ id: blogId, title: blogTitle });
    setShowDeleteModal(true);
    setShowPreview(false);
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

  const handleTabChange = (newFilter) => {
    setFilter(newFilter);
    setDepartmentFilter('all'); // Reset department filter when changing tabs
  };

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>;
  }

  const filteredCounts = getFilteredCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Blog Management</h1>
          <p className="text-gray-600">Review, edit, delete, and manage blog submissions with full admin access</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredCounts.pending}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{filteredCounts.published}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{filteredCounts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex space-x-1">
                <Button
                  variant={filter === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleTabChange('pending')}
                  className="whitespace-nowrap"
                >
                  Pending ({counts.pending})
                </Button>
                <Button
                  variant={filter === 'published' ? 'default' : 'outline'}
                  onClick={() => handleTabChange('published')}
                  className="whitespace-nowrap"
                >
                  Published ({counts.published})
                </Button>
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => handleTabChange('all')}
                  className="whitespace-nowrap"
                >
                  All ({counts.total})
                </Button>
              </div>

              {/* Department Filter Dropdown */}
              <div className="relative">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
                  >
                    <option value="all">All Departments</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept} ({departmentCounts[dept] || 0})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blogs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading blogs...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {departmentFilter !== 'all' 
                  ? `No blogs found for ${departmentFilter} in this status`
                  : 'No blogs found for this filter'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBlogs.map((blog) => (
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
                        <div>
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
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-2">
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

                          {/* Department Badge */}
                          {blog.author?.department && (
                            <div className="mb-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDepartmentBadgeClass(blog.author.department)}`}>
                                {blog.author.department}
                              </span>
                            </div>
                          )}
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
                          
                          {/* Delete button - always show for admin */}
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(blog._id, blog.title)}
                              disabled={actionLoading[blog._id]}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              {actionLoading[blog._id] ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                            
                            {/* Editorial flags display for published blogs */}
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
                      </div>
                      
                      {/* Tags */}
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
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
        onDelete={(blogId, blogTitle) => handleDeleteClick(blogId, blogTitle)}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentBlogForDeletion(null);
        }}
        onConfirm={() => handleDeleteBlog(currentBlogForDeletion.id)}
        loading={actionLoading[currentBlogForDeletion?.id]}
        blogTitle={currentBlogForDeletion?.title}
      />
    </div>
  );
}
