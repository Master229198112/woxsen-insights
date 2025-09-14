'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, File, Image as ImageIcon, Link as LinkIcon, Globe, FileText, Download, Eye } from 'lucide-react';
import Image from 'next/image';

const FileUpload = ({ 
  onFileUploaded, 
  currentFiles = [], 
  allowedTypes = ['image', 'pdf'], 
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  label = "Upload Files"
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [fileUrl, setFileUrl] = useState('');

  // Trusted domains for external files
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
    'blob.core.windows.net',
    'academia.edu',
    'researchgate.net',
    'arxiv.org',
    'ieee.org',
    'acm.org',
    'springer.com',
    'nature.com',
    'sciencedirect.com'
  ];

  const fileTypeConfig = {
    image: {
      accept: 'image/*',
      mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
      extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
      maxSize: 5 * 1024 * 1024, // 5MB for images
      icon: ImageIcon,
      color: 'text-blue-600'
    },
    pdf: {
      accept: 'application/pdf',
      mimeTypes: ['application/pdf'],
      extensions: ['.pdf'],
      maxSize: 10 * 1024 * 1024, // 10MB for PDFs
      icon: FileText,
      color: 'text-red-600'
    },
    document: {
      accept: '.doc,.docx,.txt,.rtf',
      mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'],
      extensions: ['.doc', '.docx', '.txt', '.rtf'],
      maxSize: 10 * 1024 * 1024, // 10MB for documents
      icon: File,
      color: 'text-green-600'
    }
  };

  const getAcceptedTypes = () => {
    return allowedTypes.map(type => fileTypeConfig[type]?.accept).filter(Boolean).join(',');
  };

  const validateFile = (file) => {
    // Check file type
    const isValidType = allowedTypes.some(type => {
      const config = fileTypeConfig[type];
      return config?.mimeTypes.includes(file.type);
    });

    if (!isValidType) {
      return { valid: false, error: `File type not supported. Allowed types: ${allowedTypes.join(', ')}` };
    }

    // Check file size
    const typeConfig = allowedTypes.find(type => {
      const config = fileTypeConfig[type];
      return config?.mimeTypes.includes(file.type);
    });

    const maxFileSize = typeConfig ? fileTypeConfig[typeConfig].maxSize : maxSize;
    if (file.size > maxFileSize) {
      return { valid: false, error: `File size too large. Maximum size: ${Math.round(maxFileSize / (1024 * 1024))}MB` };
    }

    // Check total files limit
    if (multiple && currentFiles.length >= maxFiles) {
      return { valid: false, error: `Maximum ${maxFiles} files allowed` };
    }

    return { valid: true };
  };

  const validateFileUrl = (url) => {
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

      // Check if URL looks like a supported file type
      const supportedExtensions = allowedTypes.flatMap(type => fileTypeConfig[type]?.extensions || []);
      const hasValidExtension = supportedExtensions.some(ext => 
        urlObj.pathname.toLowerCase().includes(ext)
      );

      // For known file services, we might not have file extensions
      const isKnownFileService = [
        'drive.google.com',
        'onedrive.live.com',
        'dropbox.com',
        'arxiv.org',
        'researchgate.net'
      ].some(service => urlObj.hostname.includes(service));

      if (!hasValidExtension && !isKnownFileService) {
        return { valid: false, error: `URL does not appear to be a valid ${allowedTypes.join('/')} file.` };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    
    // Validate each file
    for (const file of fileList) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setUploadError(validation.error);
        return;
      }
    }

    setUploading(true);
    setUploadError('');

    try {
      const uploadedFiles = [];
      
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', file.type.startsWith('image/') ? 'image' : 'document');

        const response = await fetch('/api/upload/file', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        uploadedFiles.push({
          fileName: file.name,
          fileUrl: data.url,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString()
        });
      }

      // Call the callback with the uploaded files
      if (multiple) {
        onFileUploaded([...currentFiles, ...uploadedFiles]);
      } else {
        onFileUploaded(uploadedFiles[0]);
      }
    } catch (error) {
      setUploadError(error.message);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!fileUrl.trim()) {
      setUploadError('Please enter a file URL');
      return;
    }

    const validation = validateFileUrl(fileUrl.trim());
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // For URL-based files, we'll just validate and store the URL
      const fileExtension = fileUrl.split('.').pop().toLowerCase();
      const fileType = allowedTypes.find(type => {
        const config = fileTypeConfig[type];
        return config?.extensions.some(ext => ext.includes(fileExtension));
      }) || 'document';

      const fileData = {
        fileName: fileUrl.split('/').pop() || 'External File',
        fileUrl: fileUrl.trim(),
        fileType: `external/${fileType}`,
        fileSize: 0, // Unknown size for external files
        uploadedAt: new Date().toISOString()
      };

      if (multiple) {
        onFileUploaded([...currentFiles, fileData]);
      } else {
        onFileUploaded(fileData);
      }
      
      setFileUrl('');
      setUploading(false);
    } catch (error) {
      setUploadError('Error validating file URL');
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    handleFileUpload(files);
  };

  const removeFile = (indexToRemove) => {
    if (multiple) {
      const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
      onFileUploaded(updatedFiles);
    } else {
      onFileUploaded(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return ImageIcon;
    } else if (fileType.includes('pdf')) {
      return FileText;
    } else {
      return File;
    }
  };

  const getFileTypeColor = (fileType) => {
    if (fileType.startsWith('image/')) {
      return 'text-blue-600';
    } else if (fileType.includes('pdf')) {
      return 'text-red-600';
    } else {
      return 'text-green-600';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFilePreview = (file, index) => {
    const FileIcon = getFileIcon(file.fileType);
    const isImage = file.fileType.startsWith('image/');
    
    return (
      <div key={index} className="relative border rounded-lg p-3 bg-gray-50">
        <div className="flex items-start space-x-3">
          {isImage ? (
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
              <Image
                src={file.fileUrl}
                alt={file.fileName}
                fill
                className="object-cover"
                unoptimized={file.fileType.startsWith('external/')}
              />
            </div>
          ) : (
            <div className="flex-shrink-0">
              <FileIcon className={`h-8 w-8 ${getFileTypeColor(file.fileType)}`} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.fileName}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.fileSize)}
            </p>
            {file.fileType.startsWith('external/') && (
              <p className="text-xs text-blue-600">External file</p>
            )}
          </div>
          
          <div className="flex space-x-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.open(file.fileUrl, '_blank')}
              className="p-1 h-7 w-7"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeFile(index)}
              className="p-1 h-7 w-7 text-red-600 border-red-300 hover:bg-red-50"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const hasFiles = multiple ? currentFiles.length > 0 : currentFiles !== null;

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
          Upload Files
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

      {/* Current Files */}
      {hasFiles && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
          <div className="space-y-2">
            {multiple 
              ? currentFiles.map((file, index) => renderFilePreview(file, index))
              : renderFilePreview(currentFiles, 0)
            }
          </div>
        </div>
      )}

      {/* Upload Interface */}
      {(!hasFiles || multiple) && (
        <div>
          {uploadMethod === 'upload' ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {label}
                  </p>
                  <p className="text-sm text-gray-600">
                    Drag and drop files here, or click to select
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: {allowedTypes.join(', ')} files
                    {multiple && ` (max ${maxFiles} files)`}
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    accept={getAcceptedTypes()}
                    onChange={handleFileSelect}
                    multiple={multiple}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload').click()}
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
                        Choose Files
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
                    Use File from URL
                  </p>
                  <p className="text-sm text-gray-600">
                    Enter a direct link to a file from trusted sources
                  </p>
                </div>
                <div className="space-y-3">
                  <Input
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
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
                    disabled={uploading || !fileUrl.trim()}
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
                        Use This File
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-blue-800 text-sm font-medium mb-2">Supported File Types:</p>
        <div className="text-blue-700 text-xs space-y-1">
          {allowedTypes.includes('image') && (
            <p><strong>Images:</strong> JPG, PNG, WEBP, GIF (max 5MB)</p>
          )}
          {allowedTypes.includes('pdf') && (
            <p><strong>PDFs:</strong> Research papers, documents (max 10MB)</p>
          )}
          {allowedTypes.includes('document') && (
            <p><strong>Documents:</strong> DOC, DOCX, TXT (max 10MB)</p>
          )}
          <p><strong>External URLs from:</strong> Google Drive, OneDrive, ArXiv, ResearchGate, Academic domains</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
