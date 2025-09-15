'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Globe, AlertTriangle, CheckCircle, Eye, Zap } from 'lucide-react';
import Image from 'next/image';
import { useAIImageDetector, AIImageDetectionResults } from './AiImageDetector';

const ImageUpload = ({ onImageUploaded, currentImage }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  
  // AI Detection Hook
  const { analysis, analyze } = useAIImageDetector();
  
  // Quality Analysis States
  const [analyzingQuality, setAnalyzingQuality] = useState(false);
  const [qualityAnalysis, setQualityAnalysis] = useState(null);
  const [showQualityWarning, setShowQualityWarning] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

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

  // Quality analyzer functions
  const qualityAnalyzer = {
    analyzeImageQuality: async (file) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;
          const fileSize = file.size;
          
          console.log('Quality Analysis:', { width, height, fileSize, fileName: file.name });
          
          // More strict quality scoring
          const resolutionScore = width >= 1200 && height >= 800 ? 90 : 
                                width >= 800 && height >= 600 ? 70 : 
                                width >= 600 && height >= 400 ? 50 : 
                                width >= 400 && height >= 300 ? 30 : 10;
          
          const sizeScore = fileSize > 2 * 1024 * 1024 ? 90 : 
                           fileSize > 1 * 1024 * 1024 ? 70 : 
                           fileSize > 500 * 1024 ? 50 : 
                           fileSize > 200 * 1024 ? 30 : 10;
          
          const overallScore = (resolutionScore + sizeScore) / 2;
          
          let overall = 'excellent';
          if (overallScore < 30) overall = 'very poor';
          else if (overallScore < 50) overall = 'poor';
          else if (overallScore < 70) overall = 'fair';
          else if (overallScore < 85) overall = 'good';
          
          console.log('Quality Scores:', { resolutionScore, sizeScore, overallScore, overall });
          
          const recommendations = [];
          if (width < 800 || height < 600) {
            recommendations.push('Consider using an image with at least 800x600 resolution for better quality');
          }
          if (width < 400 || height < 300) {
            recommendations.push('Image resolution is very low and may appear pixelated');
          }
          if (fileSize < 200 * 1024) {
            recommendations.push('Image file size is very small, which may indicate heavy compression');
          }
          if (fileSize < 100 * 1024) {
            recommendations.push('File size is extremely small - image quality may be severely compromised');
          }
          if (overallScore < 50) {
            recommendations.push('This image may not display well on larger screens or in print');
          }
          if (recommendations.length === 0) {
            recommendations.push('Image quality looks good for web use');
          }
          
          const analysis = {
            width,
            height,
            fileSize,
            overall,
            score: overallScore,
            resolution: {
              score: resolutionScore,
              quality: resolutionScore >= 70 ? 'good' : resolutionScore >= 50 ? 'fair' : 'poor'
            },
            blur: {
              isBlurry: false, // Simplified - can be enhanced later
              quality: 'sharp'
            },
            recommendations
          };
          
          console.log('Final Analysis:', analysis);
          resolve(analysis);
        };
        img.onerror = () => {
          resolve({
            overall: 'unknown',
            score: 0,
            recommendations: ['Could not analyze image quality'],
            error: true
          });
        };
        img.src = URL.createObjectURL(file);
      });
    },
    
    meetsMinimumQuality: (analysis) => {
      const meets = analysis.score >= 60; // Raised threshold to 60
      console.log('Quality Check:', { score: analysis.score, meets, threshold: 60 });
      return meets;
    }
  };

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

  const handleFileUpload = async (file, forceUpload = false) => {
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

    // Analyze image quality first (unless forcing upload)
    if (!forceUpload) {
      setAnalyzingQuality(true);
      setUploadError('');
      setPendingFile(file);
      
      try {
        const qualityResult = await qualityAnalyzer.analyzeImageQuality(file);
        setQualityAnalysis(qualityResult);
        
        // Check if image meets minimum quality standards
        if (!qualityAnalyzer.meetsMinimumQuality(qualityResult)) {
          setShowQualityWarning(true);
          setAnalyzingQuality(false);
          return; // Don't upload yet, show warning
        }
      } catch (error) {
        console.error('Quality analysis error:', error);
        // Continue with upload if analysis fails
      }
      
      setAnalyzingQuality(false);
    }

    // Proceed with upload
    setUploading(true);
    setUploadError('');
    setShowQualityWarning(false);

    try {
      // Start AI analysis and image upload in parallel
      const analysisPromise = analyze(file);

      const formData = new FormData();
      formData.append('file', file);

      const uploadPromise = fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      // Wait for both upload and analysis to complete
      const [response, analysisResult] = await Promise.all([uploadPromise, analysisPromise]);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Pass both URL and analysis result
      onImageUploaded(data.url, analysisResult);
      
      // Clear pending states
      setPendingFile(null);
      setQualityAnalysis(null);

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
      // Test if the image loads and run analysis
      const img = new window.Image();
      img.onload = async () => {
        try {
          // Create a fake file object for AI analysis
          const fakeFile = new File([], imageUrl.trim(), { type: 'image/jpeg' });
          const analysisResult = await analyze(fakeFile);
          onImageUploaded(imageUrl.trim(), analysisResult);
          setImageUrl('');
          setUploading(false);
        } catch (error) {
          console.error('Analysis error:', error);
          // Still upload without analysis if it fails
          onImageUploaded(imageUrl.trim(), null);
          setImageUrl('');
          setUploading(false);
        }
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
    setQualityAnalysis(null);
    setShowQualityWarning(false);
    setPendingFile(null);
  };

  const handleUploadAnyway = () => {
    if (pendingFile) {
      handleFileUpload(pendingFile, true); // Force upload
    }
  };

  const handleCancelUpload = () => {
    setShowQualityWarning(false);
    setQualityAnalysis(null);
    setPendingFile(null);
    setUploadError('');
  };

  const getQualityIcon = (quality) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fair':
        return <Eye className="h-5 w-5 text-yellow-600" />;
      case 'poor':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Zap className="h-5 w-5 text-gray-600" />;
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case 'excellent':
      case 'good':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'fair':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'poor':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  useEffect(() => {
    if (analysis) {
      console.log("Full AI analysis:", analysis);
    }
  }, [analysis]);

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
      ) : showQualityWarning && qualityAnalysis ? (
        /* Quality Warning Dialog */
        <div className={`border-2 rounded-lg p-6 ${getQualityColor(qualityAnalysis.overall)}`}>
          <div className="flex items-start space-x-3 mb-4">
            {getQualityIcon(qualityAnalysis.overall)}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Image Quality: {qualityAnalysis.overall.charAt(0).toUpperCase() + qualityAnalysis.overall.slice(1)}
              </h3>
              <div className="text-sm space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Resolution:</span> {qualityAnalysis.width}×{qualityAnalysis.height}
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      qualityAnalysis.resolution.score >= 70 ? 'bg-green-100 text-green-800' : 
                      qualityAnalysis.resolution.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {qualityAnalysis.resolution.quality}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">File Size:</span> 
                    <span className="ml-2">
                      {(qualityAnalysis.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Recommendations:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              {qualityAnalysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelUpload}
              className="flex-1"
            >
              Choose Different Image
            </Button>
            <Button
              type="button"
              onClick={handleUploadAnyway}
              disabled={uploading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {uploading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </div>
              ) : (
                'Upload Anyway'
              )}
            </Button>
          </div>
        </div>
      ) : analyzingQuality ? (
        /* Quality Analysis Loading */
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">Analyzing Image Quality...</p>
              <p className="text-sm text-gray-600">Checking resolution, size, and overall quality</p>
            </div>
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

      {/* AI Detection Results */}
      {currentImage && analysis && (
        <AIImageDetectionResults analysis={analysis} />
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-blue-800 text-sm font-medium mb-2">Image Quality & Sources:</p>
        <div className="text-blue-700 text-xs space-y-1">
          <p><strong>Upload:</strong> JPG, PNG, WEBP (max 5MB)</p>
          <p><strong>Quality Check:</strong> Automatic analysis for resolution, size, and compression</p>
          <p><strong>AI Detection:</strong> Automatic detection of AI-generated content</p>
          <p><strong>External URLs from:</strong> Imgur, Pexels, GitHub, University domains</p>
          <p><strong>Minimum recommended:</strong> 800×600px, sharp focus, minimal compression</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
