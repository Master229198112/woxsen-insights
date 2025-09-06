'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Globe } from 'lucide-react';
import Image from 'next/image';

const ImageUpload = ({ onImageUploaded, currentImage }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState('');

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

      onImageUploaded(data.url);
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
        onImageUploaded(imageUrl.trim());
        setImageUrl('');
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

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  const removeImage = () => {
    onImageUploaded('');
    setImageUrl('');
  };

  return (
    <div className="space-y-4">
      {/* Upload Method Toggle */}
      <div className="flex space-x-2 mb-4">
        <Button
          type="button"
          variant={uploadMethod === 'upload' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('upload')}
          className="flex items-center"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
        <Button
          type="button"
          variant={uploadMethod === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMethod('url')}
          className="flex items-center"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Use URL
        </Button>
      </div>

      {currentImage ? (
        <div className="relative">
          <div className="relative w-full h-64 rounded-lg overflow-hidden border">
            <Image
              src={currentImage}
              alt="Featured image"
              fill
              className="object-cover"
              unoptimized={!currentImage.includes('cloudinary')} // Don't optimize external images
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentImage.includes('cloudinary') ? 'Uploaded' : 'External URL'}
          </div>
        </div>
      ) : uploadMethod === 'upload' ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload Featured Image
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
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload').click()}
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
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Globe className="h-12 w-12 text-gray-400" />
            </div>
            <div>
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
                variant="outline"
                onClick={handleUrlSubmit}
                disabled={uploading || !imageUrl.trim()}
                className="w-full"
              >
                {uploading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Validating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Use This Image
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-blue-800 text-sm font-medium mb-2">Supported Image Sources:</p>
        <div className="text-blue-700 text-xs space-y-1">
          <p><strong>Upload:</strong> JPG, PNG, WEBP (max 5MB)</p>
          <p><strong>External URLs from:</strong> Google Drive, OneDrive, Dropbox, Imgur, Unsplash, Pexels, GitHub, University domains</p>
          <p><strong>Tip:</strong> For Google Drive, use "Get link" and ensure it's set to "Anyone with the link can view"</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
