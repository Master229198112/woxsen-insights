// ========================================
// 📁 components/RichTextEditor.jsx (Enhanced with Inline Image Upload)
// ========================================
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  ImageIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Upload,
  X,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import NextImage from 'next/image';

const RichTextEditor = ({ content, onChange, placeholder = "Start writing..." }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUploadMethod, setImageUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Trusted domains for external images
  const trustedDomains = [
    'res.cloudinary.com',
    'lh3.googleusercontent.com',
    'drive.google.com',
    'docs.google.com',
    'onedrive.live.com',
    '1drv.ms',
    'dl.dropboxusercontent.com',
    'imgur.com',
    'i.imgur.com',
    'images.unsplash.com',
    'images.pexels.com',
    'raw.githubusercontent.com',
    'woxsen.edu.in',
    'amazonaws.com',
    'blob.core.windows.net'
  ];

  // Fix SSR hydration issue
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-md my-2 cursor-pointer',
        },
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline hover:text-blue-700',
        },
      }),
    ],
    content: content || '',
    immediatelyRender: false, // Fix SSR hydration issue
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 max-w-none',
      },
    },
  });

  // Update content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [editor, content]);

  const validateImageUrl = (url) => {
    try {
      const urlObj = new URL(url);
      
      // Check if the domain is in our trusted list
      const isDomainTrusted = trustedDomains.some(domain => {
        return urlObj.hostname === domain || 
               urlObj.hostname.endsWith('.' + domain) ||
               urlObj.hostname.includes(domain);
      });

      if (!isDomainTrusted) {
        return { valid: false, error: 'Domain not in trusted list. Please contact admin to add this domain.' };
      }

      // Check if URL looks like an image
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
      const hasImageExtension = imageExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );

      // For Google Drive, OneDrive, etc., we might not have file extensions
      const isKnownImageService = [
        'drive.google.com',
        'onedrive.live.com',
        'dropbox.com',
        'imgur.com'
      ].some(service => urlObj.hostname.includes(service));

      if (!hasImageExtension && !isKnownImageService) {
        return { valid: false, error: 'URL does not appear to be an image. Please ensure it\'s a direct image link.' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Insert image at cursor position
      if (editor) {
        editor.chain().focus().setImage({ src: data.url }).run();
        setShowImageDialog(false);
        setImageUrl('');
      }
    } catch (error) {
      setUploadError(error.message);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) {
      setUploadError('Please enter an image URL');
      return;
    }

    const validation = validateImageUrl(imageUrl.trim());
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // Test if the image loads
      const img = new window.Image();
      img.onload = () => {
        // Insert image at cursor position
        if (editor) {
          editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
          setShowImageDialog(false);
          setImageUrl('');
        }
        setUploading(false);
      };
      img.onerror = () => {
        setUploadError('Failed to load image from URL. Please check the URL and try again.');
        setUploading(false);
      };
      img.src = imageUrl.trim();
    } catch (error) {
      setUploadError('Error validating image URL');
      setUploading(false);
    }
  };

  const openImageDialog = useCallback(() => {
    if (!editor) return;
    setShowImageDialog(true);
    setUploadError('');
    setImageUrl('');
  }, [editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);
    
    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const closeImageDialog = () => {
    setShowImageDialog(false);
    setImageUrl('');
    setUploadError('');
    setUploading(false);
  };

  // Don't render until mounted (prevents SSR issues)
  if (!isMounted) {
    return (
      <div className="border rounded-md min-h-[200px] p-4 bg-gray-50">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="border rounded-md min-h-[200px] p-4 bg-gray-50">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Initializing editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="border rounded-md">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={openImageDialog}
            title="Insert Image"
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLink}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor */}
        <div 
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Image Upload Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Insert Image
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeImageDialog}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Upload Method Toggle */}
              <div className="flex space-x-2 mb-6">
                <Button
                  type="button"
                  variant={imageUploadMethod === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageUploadMethod('upload')}
                  className="flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={imageUploadMethod === 'url' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setImageUploadMethod('url')}
                  className="flex items-center"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Use URL
                </Button>
              </div>

              {imageUploadMethod === 'upload' ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Upload Image
                      </p>
                      <p className="text-sm text-gray-600">
                        Drag and drop an image here, or click to select
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="inline-image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('inline-image-upload').click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Image
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                      Use Image from URL
                    </p>
                    <p className="text-sm text-gray-600">
                      Enter a direct link to an image from trusted sources
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full"
                      disabled={uploading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleUrlSubmit();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleUrlSubmit}
                      disabled={uploading || !imageUrl.trim()}
                      className="w-full"
                    >
                      {uploading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Validating...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Insert Image
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                  <p className="text-red-600 text-sm">{uploadError}</p>
                </div>
              )}

              {/* Help Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-4">
                <p className="text-blue-800 text-sm font-medium mb-2">Tips:</p>
                <div className="text-blue-700 text-xs space-y-1">
                  <p>• Images will be inserted at your cursor position</p>
                  <p>• Drag & drop images directly into the editor</p>
                  <p>• Supported formats: JPG, PNG, WEBP (max 5MB)</p>
                  <p>• External URLs from trusted domains only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;