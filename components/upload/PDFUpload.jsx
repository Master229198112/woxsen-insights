'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, FileText, Link as LinkIcon, Globe, Download, Eye, ExternalLink } from 'lucide-react';

const PDFUpload = ({ 
  onPDFUploaded, 
  currentPDF = null,
  label = "Upload PDF Document",
  placeholder = "https://example.com/document.pdf",
  maxSize = 10 * 1024 * 1024 // 10MB default
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadMethod, setUploadMethod] = useState('upload'); // 'upload' or 'url'
  const [pdfUrl, setPdfUrl] = useState('');

  // Trusted domains for external PDFs
  const trustedDomains = [
    'res.cloudinary.com',
    'drive.google.com',
    'docs.google.com',
    'onedrive.live.com',
    '1drv.ms',
    'dl.dropboxusercontent.com',
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
    'sciencedirect.com',
    'wiley.com',
    'tandfonline.com',
    'sage.com',
    'elsevier.com',
    'jstor.org',
    'pubmed.ncbi.nlm.nih.gov',
    'biorxiv.org',
    'medrxiv.org'
  ];

  const validatePDF = (file) => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Please select a PDF file' };
    }

    // Check file size
    if (file.size > maxSize) {
      return { valid: false, error: `PDF size must be less than ${Math.round(maxSize / (1024 * 1024))}MB` };
    }

    return { valid: true };
  };

  const validatePDFUrl = (url) => {
    try {
      const urlObj = new URL(url);
      
      // Allow any HTTPS URL (more permissive approach)
      if (urlObj.protocol !== 'https:') {
        return { valid: false, error: 'Only HTTPS URLs are allowed for security reasons.' };
      }

      // Optional: Check if URL looks like a PDF (commented out for maximum flexibility)
      // const isPDFUrl = urlObj.pathname.toLowerCase().includes('.pdf');
      // 
      // // For known academic/document services, we might not have .pdf extension
      // const isKnownPDFService = [
      //   'drive.google.com',
      //   'onedrive.live.com',
      //   'dropbox.com',
      //   'arxiv.org',
      //   'researchgate.net',
      //   'academia.edu',
      //   'ieee.org',
      //   'acm.org'
      // ].some(service => urlObj.hostname.includes(service));
      //
      // if (!isPDFUrl && !isKnownPDFService) {
      //   return { valid: false, error: 'URL does not appear to be a PDF file. Please ensure it\'s a direct PDF link.' };
      // }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format. Please enter a valid HTTPS URL.' };
    }
  };

  const handlePDFUpload = async (file) => {
    if (!file) return;

    const validation = validatePDF(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'pdf');

      const response = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'PDF upload failed');
      }

      const pdfData = {
        fileName: file.name,
        fileUrl: data.url,
        fileType: 'application/pdf',
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        thumbnailUrl: data.thumbnailUrl // If PDF thumbnail generation is implemented
      };

      onPDFUploaded(pdfData);
    } catch (error) {
      setUploadError(error.message);
      console.error('PDF upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!pdfUrl.trim()) {
      setUploadError('Please enter a PDF URL');
      return;
    }

    const validation = validatePDFUrl(pdfUrl.trim());
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // For URL-based PDFs, we'll validate and store the URL
      const fileName = pdfUrl.split('/').pop() || 'External PDF';
      const cleanFileName = fileName.includes('.pdf') ? fileName : `${fileName}.pdf`;

      const pdfData = {
        fileName: cleanFileName,
        fileUrl: pdfUrl.trim(),
        fileType: 'external/pdf',
        fileSize: 0, // Unknown size for external files
        uploadedAt: new Date().toISOString()
      };

      onPDFUploaded(pdfData);
      setPdfUrl('');
      setUploading(false);
    } catch (error) {
      setUploadError('Error validating PDF URL');
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handlePDFUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handlePDFUpload(file);
  };

  const removePDF = () => {
    onPDFUploaded(null);
    setPdfUrl('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openPDF = () => {
    if (currentPDF?.fileUrl) {
      window.open(currentPDF.fileUrl, '_blank');
    }
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
          Upload PDF
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

      {/* Current PDF Display */}
      {currentPDF ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <FileText className="h-12 w-12 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {currentPDF.fileName}
              </h4>
              <p className="text-sm text-gray-500">
                {formatFileSize(currentPDF.fileSize)}
              </p>
              {currentPDF.fileType?.startsWith('external/') && (
                <div className="flex items-center text-xs text-blue-600 mt-1">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  External file
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Uploaded: {new Date(currentPDF.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openPDF}
                className="flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removePDF}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
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
              <FileText className="h-16 w-16 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {label}
              </p>
              <p className="text-sm text-gray-600">
                Drag and drop a PDF here, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum file size: {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
            <div>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('pdf-upload').click()}
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
                    Choose PDF
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
                Use PDF from URL
              </p>
              <p className="text-sm text-gray-600">
                Enter any HTTPS link to a PDF document
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="url"
                placeholder={placeholder}
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
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
                disabled={uploading || !pdfUrl.trim()}
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
                    Use This PDF
                  </div>
                )}
              </Button>
            </div>
          </div>
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
        <p className="text-blue-800 text-sm font-medium mb-2">PDF Upload Guidelines:</p>
        <div className="text-blue-700 text-xs space-y-1">
          <p><strong>Supported:</strong> PDF files up to {Math.round(maxSize / (1024 * 1024))}MB</p>
          <p><strong>External URLs:</strong> Any HTTPS URL pointing to a PDF document</p>
          <p><strong>Examples:</strong> Research papers, documentation, reports from any secure website</p>
          <p><strong>Best Practice:</strong> Ensure PDFs are text-searchable and properly formatted</p>
        </div>
      </div>
    </div>
  );
};

export default PDFUpload;
