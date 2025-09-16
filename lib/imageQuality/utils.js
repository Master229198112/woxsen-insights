// Image Quality Utilities and Constants
// Shared constants and helper functions for image quality analysis

export const IMAGE_QUALITY_CONSTANTS = {
  // Minimum dimensions
  MIN_WIDTH: 400,
  MIN_HEIGHT: 300,
  
  // Recommended dimensions
  RECOMMENDED_WIDTH: 1200,
  RECOMMENDED_HEIGHT: 800,
  
  // File size limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MIN_FILE_SIZE: 50 * 1024, // 50KB
  OPTIMAL_MIN_SIZE: 200 * 1024, // 200KB
  
  // Quality thresholds
  BLUR_THRESHOLD: 100,
  QUALITY_THRESHOLDS: {
    EXCELLENT: 85,
    GOOD: 65,
    FAIR: 45,
    POOR: 25
  },
  
  // Supported formats
  SUPPORTED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  
  // Aspect ratios
  COMMON_ASPECT_RATIOS: [
    { ratio: 16/9, name: 'Widescreen' },
    { ratio: 4/3, name: 'Standard' },
    { ratio: 3/2, name: 'Classic' },
    { ratio: 1/1, name: 'Square' }
  ]
};

export const IMAGE_QUALITY_WEIGHTS = {
  resolution: 0.4,
  blur: 0.35,
  compression: 0.25
};

// Quality level helpers
export const getQualityLevel = (score) => {
  if (score >= IMAGE_QUALITY_CONSTANTS.QUALITY_THRESHOLDS.EXCELLENT) return 'excellent';
  if (score >= IMAGE_QUALITY_CONSTANTS.QUALITY_THRESHOLDS.GOOD) return 'good';
  if (score >= IMAGE_QUALITY_CONSTANTS.QUALITY_THRESHOLDS.FAIR) return 'fair';
  if (score >= IMAGE_QUALITY_CONSTANTS.QUALITY_THRESHOLDS.POOR) return 'poor';
  return 'very poor';
};

export const getQualityColor = (level) => {
  switch (level) {
    case 'excellent': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
    case 'good': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' };
    case 'fair': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' };
    case 'poor': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' };
    default: return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };
  }
};

// File size formatting
export const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

// Aspect ratio detection
export const detectAspectRatio = (width, height) => {
  const ratio = width / height;
  const closest = IMAGE_QUALITY_CONSTANTS.COMMON_ASPECT_RATIOS.reduce((prev, curr) => {
    return Math.abs(curr.ratio - ratio) < Math.abs(prev.ratio - ratio) ? curr : prev;
  });
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    closest: closest.name,
    isStandard: Math.abs(closest.ratio - ratio) < 0.1
  };
};

// Image optimization suggestions
export const getOptimizationSuggestions = (analysis) => {
  const suggestions = [];
  
  // Resolution suggestions
  if (analysis.width < IMAGE_QUALITY_CONSTANTS.RECOMMENDED_WIDTH) {
    suggestions.push({
      type: 'resolution',
      priority: 'high',
      message: `Consider using a higher resolution image (current: ${analysis.width}×${analysis.height}, recommended: ${IMAGE_QUALITY_CONSTANTS.RECOMMENDED_WIDTH}×${IMAGE_QUALITY_CONSTANTS.RECOMMENDED_HEIGHT})`
    });
  }
  
  // File size suggestions
  if (analysis.fileSize > IMAGE_QUALITY_CONSTANTS.MAX_FILE_SIZE * 0.8) {
    suggestions.push({
      type: 'filesize',
      priority: 'medium',
      message: 'File size is quite large. Consider optimizing the image to reduce load times.'
    });
  } else if (analysis.fileSize < IMAGE_QUALITY_CONSTANTS.OPTIMAL_MIN_SIZE) {
    suggestions.push({
      type: 'filesize',
      priority: 'low',
      message: 'File size is small, which may indicate heavy compression. Consider using a less compressed version.'
    });
  }
  
  // Blur suggestions
  if (analysis.blur && analysis.blur.isBlurry) {
    suggestions.push({
      type: 'blur',
      priority: 'high',
      message: 'Image appears blurry. Please use a sharper image for better quality.'
    });
  }
  
  return suggestions;
};

// Quality scoring helpers
export const calculateWeightedScore = (scores, weights = IMAGE_QUALITY_WEIGHTS) => {
  return Object.keys(weights).reduce((total, key) => {
    return total + (scores[key] || 0) * weights[key];
  }, 0);
};

// Image validation
export const validateImageFile = (file) => {
  const errors = [];
  
  // Check file type
  if (!IMAGE_QUALITY_CONSTANTS.SUPPORTED_FORMATS.includes(file.type)) {
    errors.push('Unsupported file format. Please use JPEG, PNG, or WebP.');
  }
  
  // Check file size
  if (file.size > IMAGE_QUALITY_CONSTANTS.MAX_FILE_SIZE) {
    errors.push(`File size too large. Maximum allowed: ${formatFileSize(IMAGE_QUALITY_CONSTANTS.MAX_FILE_SIZE)}`);
  }
  
  if (file.size < IMAGE_QUALITY_CONSTANTS.MIN_FILE_SIZE) {
    errors.push('File size too small. This may indicate a corrupted or very low quality image.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  IMAGE_QUALITY_CONSTANTS,
  IMAGE_QUALITY_WEIGHTS,
  getQualityLevel,
  getQualityColor,
  formatFileSize,
  detectAspectRatio,
  getOptimizationSuggestions,
  calculateWeightedScore,
  validateImageFile
};