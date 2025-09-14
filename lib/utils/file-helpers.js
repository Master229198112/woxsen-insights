// ===================================================================
// FILE: /lib/utils/file-helpers.js
// PURPOSE: Utility functions for file handling and validation
// ===================================================================

export const fileHelpers = {
  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file type
  validateFileType: (file, allowedTypes = ['image', 'pdf', 'document']) => {
    const fileTypeMap = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
      pdf: ['application/pdf'],
      document: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf'
      ]
    };

    const allowedMimeTypes = allowedTypes.flatMap(type => fileTypeMap[type] || []);
    return allowedMimeTypes.includes(file.type);
  },

  // Generate thumbnail for images
  generateThumbnail: (file, maxWidth = 300, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  // Extract metadata from files
  extractMetadata: async (file) => {
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      uploadedAt: new Date().toISOString()
    };

    if (file.type.startsWith('image/')) {
      try {
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = URL.createObjectURL(file);
        });
        
        metadata.dimensions = {
          width: img.width,
          height: img.height
        };
      } catch (error) {
        console.warn('Could not extract image dimensions:', error);
      }
    }

    return metadata;
  }
};
