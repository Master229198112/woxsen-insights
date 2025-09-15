'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ImageUpload from '@/components/ImageUpload';
import dynamic from 'next/dynamic';
import { 
  PenTool, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  Award,
  Beaker,
  Calendar,
  Lightbulb,
  Users,
  Briefcase,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { validatePostData } from '@/lib/validation/schemas';

// Dynamic imports for specialized forms to avoid bundle bloat
const ResearchForm = dynamic(() => import('./ResearchForm'), {
  ssr: false,
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>
});

const PatentForm = dynamic(() => import('./PatentForm'), {
  ssr: false,
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>
});

const AchievementForm = dynamic(() => import('./AchievementForm'), {
  ssr: false,
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>
});

const EventForm = dynamic(() => import('./EventForm'), {
  ssr: false,
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>
});

// Dynamically import RichTextEditor
const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="border rounded-md min-h-[200px] p-4 bg-gray-50">
      <div className="flex items-center justify-center h-32">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500">Loading editor...</span>
        </div>
      </div>
    </div>
  )
});

const DynamicPostForm = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    featuredImage: '',
    slug: '', // Add slug to form data
    imageAnalysis: null, // Add image analysis data
    // Category-specific data will be added here
    researchData: null,
    patentData: null,
    achievementData: null,
    eventData: null
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Categories with detailed information
  const categories = [
    { 
      value: 'research', 
      label: 'Research & Publications', 
      description: 'Research papers, journal articles, conference papers',
      icon: Beaker,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      iconColor: 'text-blue-600'
    },

    { 
      value: 'patents', 
      label: 'Patent', 
      description: 'Intellectual property and innovations',
      icon: Lightbulb,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconColor: 'text-yellow-600'
    },
    { 
      value: 'achievements', 
      label: 'Achievement', 
      description: 'Awards, grants, and recognitions',
      icon: Award,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      iconColor: 'text-purple-600'
    },
    { 
      value: 'events', 
      label: 'Event', 
      description: 'Conferences, workshops, seminars',
      icon: Calendar,
      color: 'bg-red-50 border-red-200 text-red-800',
      iconColor: 'text-red-600'
    },
    { 
      value: 'case-studies', 
      label: 'Case Study', 
      description: 'Business case studies and analysis',
      icon: FileText,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      iconColor: 'text-indigo-600'
    },
    { 
      value: 'blogs', 
      label: 'Blog Post', 
      description: 'Thought leadership and insights',
      icon: PenTool,
      color: 'bg-gray-50 border-gray-200 text-gray-800',
      iconColor: 'text-gray-600'
    },
    { 
      value: 'industry-collaborations', 
      label: 'Industry Collaboration', 
      description: 'Partnerships and joint initiatives',
      icon: Users,
      color: 'bg-teal-50 border-teal-200 text-teal-800',
      iconColor: 'text-teal-600'
    }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setValidationErrors([]);

    try {
      // Validate using Zod schemas
      const validationResult = validatePostData(formData);
      
      if (!validationResult.success) {
        setValidationErrors(validationResult.errors);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setValidationErrors(data.details.map(detail => ({ message: detail })));
        } else {
          setErrors({ submit: data.error || 'Failed to create post' });
        }
        return;
      }

      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      setErrors({ submit: 'An error occurred while creating the post' });
      console.error('Create post error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate slug from title
  const generateSlugFromTitle = (title) => {
    if (!title || typeof title !== 'string') {
      return '';
    }
    
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters but keep hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .substring(0, 50) // Limit length
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate slug when title changes
    const updates = { [name]: value };
    if (name === 'title') {
      updates.slug = generateSlugFromTitle(value);
    }
    
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: null }));
    }
  };

  const handleImageUpload = (imageUrl, imageAnalysis = null) => {
    setFormData(prev => ({ 
      ...prev, 
      featuredImage: imageUrl, 
      imageAnalysis: imageAnalysis 
    }));
    if (errors.featuredImage) {
      setErrors(prev => ({ ...prev, featuredImage: null }));
    }
  };

  const handleCategoryChange = (categoryValue) => {
    const isSpecializedCategory = ['research', 'patents', 'achievements', 'events'].includes(categoryValue);
    
    setFormData(prev => ({
      ...prev,
      category: categoryValue,
      // For specialized categories, set default values for content and excerpt
      content: isSpecializedCategory ? '' : prev.content,
      excerpt: isSpecializedCategory ? '' : prev.excerpt,
      // Reset category-specific data when changing categories
      researchData: categoryValue === 'research' ? {} : null,
      patentData: categoryValue === 'patents' ? {} : null,
      achievementData: categoryValue === 'achievements' ? {} : null,
      eventData: categoryValue === 'events' ? {} : null
    }));
    setErrors({});
    setValidationErrors([]);
  };

  const handleSpecializedDataChange = (dataType, data) => {
    setFormData(prev => ({
      ...prev,
      [dataType]: data
    }));
  };

  // Enhanced tag handling - supports both comma-separated and individual entry
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    // Check if input contains commas or semicolons for bulk processing
    const separators = /[,;]/;
    if (separators.test(tagInput)) {
      // Process comma/semicolon-separated tags
      const newTags = tagInput
        .split(separators)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && !formData.tags.includes(tag));
      
      if (newTags.length > 0) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, ...newTags]
        }));
      }
    } else {
      // Process single tag
      const trimmedTag = tagInput.trim();
      if (trimmedTag && !formData.tags.includes(trimmedTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, trimmedTag]
        }));
      }
    }
    
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === ',' || e.key === ';') {
      // Auto-add tag when comma or semicolon is pressed
      e.preventDefault();
      const currentValue = tagInput.trim();
      if (currentValue) {
        // Add the current tag before the separator
        if (!formData.tags.includes(currentValue)) {
          setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, currentValue]
          }));
        }
        setTagInput('');
      }
    }
  };

  // Handle paste events for comma-separated tags
  const handleTagPaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    const separators = /[,;]/;
    
    if (separators.test(pastedText)) {
      e.preventDefault();
      
      // Combine current input with pasted text
      const fullText = tagInput + pastedText;
      const newTags = fullText
        .split(separators)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && !formData.tags.includes(tag));
      
      if (newTags.length > 0) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, ...newTags]
        }));
      }
      
      setTagInput('');
    }
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Submitted Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Your {categories.find(cat => cat.value === formData.category)?.label?.toLowerCase() || 'post'} has been submitted for review. An admin will review and publish it soon.
            </p>
            <div className="space-y-4">
              <Link href="/dashboard">
                <Button className="w-full">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render category-specific form
  const renderSpecializedForm = () => {
    switch (formData.category) {
      case 'research':
        return (
          <ResearchForm 
            data={formData.researchData || {}}
            onChange={(data) => handleSpecializedDataChange('researchData', data)}
            errors={validationErrors.filter(err => err.path?.startsWith('researchData'))}
          />
        );
      case 'patents':
        return (
          <PatentForm 
            data={formData.patentData || {}}
            onChange={(data) => handleSpecializedDataChange('patentData', data)}
            errors={validationErrors.filter(err => err.path?.startsWith('patentData'))}
          />
        );
      case 'achievements':
        return (
          <AchievementForm 
            data={formData.achievementData || {}}
            onChange={(data) => handleSpecializedDataChange('achievementData', data)}
            errors={validationErrors.filter(err => err.path?.startsWith('achievementData'))}
          />
        );
      case 'events':
        return (
          <EventForm 
            data={formData.eventData || {}}
            onChange={(data) => handleSpecializedDataChange('eventData', data)}
            errors={validationErrors.filter(err => err.path?.startsWith('eventData'))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Post</h1>
        <p className="text-gray-600">Share your insights with the Woxsen community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Global Error Messages */}
        {(errors.submit || validationErrors.length > 0) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Please fix the following errors:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errors.submit && <li>{errors.submit}</li>}
              {validationErrors.map((error, index) => (
                <li key={index}>
                  {error.path && <span className="font-medium">{error.path}:</span>} {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Category Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const isSelected = formData.category === category.value;
                return (
                  <div
                    key={category.value}
                    onClick={() => handleCategoryChange(category.value)}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      isSelected 
                        ? `${category.color} border-opacity-100 shadow-md` 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${isSelected ? category.iconColor : 'text-gray-400'}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium ${isSelected ? 'text-inherit' : 'text-gray-900'}`}>
                          {category.label}
                        </h3>
                        <p className={`text-sm mt-1 ${isSelected ? 'text-inherit opacity-80' : 'text-gray-500'}`}>
                          {category.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-current" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Only show rest of form if category is selected */}
        {formData.category && (
          <>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter a compelling title"
                    className={`w-full ${errors.title ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Hide Excerpt for specific categories */}
                {!['research', 'patents', 'achievements', 'events'].includes(formData.category) && (
                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt *
                    </label>
                    <Textarea
                      id="excerpt"
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="Write a compelling summary (150-300 characters)"
                      className={`w-full h-24 ${errors.excerpt ? 'border-red-500' : ''}`}
                      maxLength={300}
                      required
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.excerpt && (
                        <p className="text-red-600 text-sm">{errors.excerpt}</p>
                      )}
                      <p className="text-xs text-gray-500 ml-auto">
                        {formData.excerpt.length}/300 characters
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image *</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload 
                  onImageUploaded={handleImageUpload}
                  currentImage={formData.featuredImage}
                />
                {errors.featuredImage && (
                  <p className="text-red-600 text-sm mt-2">{errors.featuredImage}</p>
                )}
              </CardContent>
            </Card>

            {/* Content - Hide for specific categories */}
            {!['research', 'patents', 'achievements', 'events'].includes(formData.category) && (
              <Card>
                <CardHeader>
                  <CardTitle>Content *</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    content={formData.content}
                    onChange={handleContentChange}
                    placeholder="Start writing your content..."
                  />
                  {errors.content && (
                    <p className="text-red-600 text-sm mt-2">{errors.content}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Category-Specific Forms */}
            {renderSpecializedForm()}

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Add relevant tags to help categorize your content. You can:
                  <br />
                  • Type a tag and press <kbd className="px-1 py-0.5 text-xs bg-gray-100 border rounded">Enter</kbd> to add it
                  • Enter multiple tags separated by commas: <code className="text-xs bg-gray-100 px-1 rounded">tag1, tag2, tag3</code>
                  • Use semicolons as separators: <code className="text-xs bg-gray-100 px-1 rounded">tag1; tag2; tag3</code>
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      onPaste={handleTagPaste}
                      placeholder="Add tags (Enter, comma, or semicolon to separate)"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add Tag
                    </Button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} added:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 transition-all hover:bg-blue-200"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                              title="Remove tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Examples */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Examples:</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div>Single tag: <code className="bg-white px-1 rounded">machine learning</code> + Enter</div>
                      <div>Multiple tags: <code className="bg-white px-1 rounded">AI, data science, research, innovation</code></div>
                      <div>With semicolons: <code className="bg-white px-1 rounded">blockchain; cryptocurrency; fintech</code></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[160px]">
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <PenTool className="h-4 w-4 mr-2" />
                    Submit for Review
                  </div>
                )}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default DynamicPostForm;
