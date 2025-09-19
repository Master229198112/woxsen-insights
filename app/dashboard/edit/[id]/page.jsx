'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  Save, 
  Upload, 
  Eye, 
  Clock,
  AlertTriangle,
  History,
  ArrowLeft,
  FileText,
  CheckCircle
} from 'lucide-react';

// Dynamically import the comprehensive editor
const ComprehensiveRichTextEditor = dynamic(() => import('@/components/ComprehensiveRichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md min-h-[300px] p-4 bg-gray-50">
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500">Loading comprehensive editor...</span>
        </div>
      </div>
    </div>
  )
});

export default function EditBlog() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const blogId = params.id;
  
  const [blog, setBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    featuredImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const autoSaveIntervalRef = useRef(null);
  const contentRef = useRef(null);

  const categories = [
    'research', 
    'achievements', 
    'publications', 
    'events', 
    'patents',
    'case-studies',
    'blogs',
    'industry-collaborations'
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    fetchBlog();
  }, [session, status, blogId, router]);

  useEffect(() => {
    // Auto-save every 30 seconds if there are unsaved changes
    if (hasUnsavedChanges && blog) {
      autoSaveIntervalRef.current = setInterval(() => {
        autoSave();
      }, 30000);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [hasUnsavedChanges, formData]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${blogId}/edit`);
      const data = await response.json();
      
      if (response.ok) {
        setBlog(data.blog);
        setPermissions(data.permissions);
        setFormData({
          title: data.blog.title,
          content: data.blog.content,
          excerpt: data.blog.excerpt,
          category: data.blog.category,
          tags: data.blog.tags || [],
          featuredImage: data.blog.featuredImage
        });
        
        // Check for auto-saved data
        const autoSaveResponse = await fetch(`/api/blogs/${blogId}/autosave`);
        const autoSaveData = await autoSaveResponse.json();
        
        if (autoSaveData.autoSaveData && autoSaveData.autoSaveData.lastSaved) {
          const autoSavedDate = new Date(autoSaveData.autoSaveData.lastSaved);
          const blogUpdatedDate = new Date(data.blog.updatedAt);
          
          if (autoSavedDate > blogUpdatedDate) {
            // Show option to restore auto-saved data
            const restore = confirm('Auto-saved changes found. Would you like to restore them?');
            if (restore) {
              setFormData(prev => ({
                ...prev,
                title: autoSaveData.autoSaveData.title || prev.title,
                content: autoSaveData.autoSaveData.content || prev.content,
                excerpt: autoSaveData.autoSaveData.excerpt || prev.excerpt
              }));
              setHasUnsavedChanges(true);
            }
          }
        }
      } else {
        alert(data.error || 'Failed to fetch blog');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Fetch blog error:', error);
      alert('Failed to fetch blog');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!hasUnsavedChanges || autoSaving) return;

    try {
      setAutoSaving(true);
      const response = await fetch(`/api/blogs/${blogId}/autosave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLastSaved(new Date(data.lastSaved));
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleInputChange('tags', tags);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();
      if (response.ok) {
        handleInputChange('featuredImage', data.imageUrl);
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image');
    }
  };

  const handleSave = async (submitForReview = false) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/blogs/${blogId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submitForReview
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setBlog(data.blog);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        
        if (submitForReview) {
          alert('Blog submitted for review successfully!');
          router.push('/dashboard');
        } else {
          alert('Blog saved successfully!');
        }
      } else {
        alert(data.error || 'Failed to save blog');
      }
    } catch (error) {
      console.error('Save blog error:', error);
      alert('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading blog editor...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Blog not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  blog.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  blog.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  blog.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                  blog.status === 'published' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                </span>
                
                {lastSaved && (
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                
                {autoSaving && (
                  <span className="flex items-center text-blue-600">
                    <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                    Auto-saving...
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </Button>
            
            <Button
              onClick={() => handleSave(false)}
              disabled={saving || !hasUnsavedChanges}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </Button>
            
            {blog.status === 'draft' && (
              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Submit for Review</span>
              </Button>
            )}
          </div>
        </div>

        {/* Warning for published blog editing */}
        {permissions.isAdmin && ['published', 'approved'].includes(blog.status) && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">Admin Edit Mode</p>
                  <p className="text-sm text-orange-700">
                    You are editing a {blog.status} blog. Changes will be tracked and the author will be notified.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <Card>
              <CardHeader>
                <CardTitle>Blog Title</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Enter blog title..."
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Make it compelling and descriptive</span>
                  <span>{formData.title.length}/200</span>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent>
                <ComprehensiveRichTextEditor
                  content={formData.content}
                  onChange={(content) => handleInputChange('content', content)}
                  placeholder="Write your blog content here..."
                  maxCharacters={100000}
                  showCharacterCount={true}
                  showWordCount={true}
                  autoSave={true}
                  onAutoSave={(content) => {
                    // Trigger auto-save
                    if (hasUnsavedChanges) {
                      autoSave();
                    }
                  }}
                  className="min-h-[400px]"
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>Use the comprehensive editor with all formatting options</span>
                </div>
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief description of your blog..."
                  maxLength={300}
                />
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>This will appear in blog previews</span>
                  <span>{formData.excerpt.length}/300</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.featuredImage && (
                  <div className="mb-4">
                    <Image
                      src={formData.featuredImage}
                      alt="Featured image"
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-sm text-gray-500 mt-2">Separate tags with commas</p>
              </CardContent>
            </Card>

            {/* Edit History */}
            {showHistory && blog.editHistory && blog.editHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {blog.editHistory.slice().reverse().map((edit, index) => (
                      <div key={index} className="text-sm border-l-2 border-blue-200 pl-3">
                        <p className="font-medium">Version {edit.version}</p>
                        <p className="text-gray-600">{edit.changes}</p>
                        <p className="text-xs text-gray-500">
                          {edit.editedBy && typeof edit.editedBy === 'object' 
                            ? `By ${edit.editedBy.name} •` 
                            : 'By Admin •'
                          } {new Date(edit.editedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rejection History */}
            {blog.rejectionHistory && blog.rejectionHistory.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Rejection History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blog.rejectionHistory.slice().reverse().map((rejection, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium text-red-700">
                          Reason: {rejection.reason}
                        </p>
                        {rejection.customReason && (
                          <p className="text-red-600 mt-1">{rejection.customReason}</p>
                        )}
                        <p className="text-xs text-red-500 mt-1">
                          {new Date(rejection.rejectedAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
