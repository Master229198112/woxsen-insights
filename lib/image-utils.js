// Utility functions for handling external image URLs from various services

/**
 * Convert various shareable image URLs to direct image URLs
 * @param {string} url - The original shareable URL
 * @returns {string} - Direct image URL or original URL if no conversion needed
 */
export function convertToDirectImageUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Google Drive link conversion
    if (urlObj.hostname === 'drive.google.com') {
      // Convert Google Drive sharing link to direct download link
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }
    
    // OneDrive link conversion
    if (urlObj.hostname.includes('onedrive.live.com') || urlObj.hostname.includes('1drv.ms')) {
      // OneDrive sharing links can be converted to direct links
      if (url.includes('?')) {
        return url.replace('?', '/download?');
      }
    }
    
    // Dropbox link conversion
    if (urlObj.hostname === 'dropbox.com' || urlObj.hostname === 'www.dropbox.com') {
      // Convert Dropbox sharing link to direct download
      return url.replace('dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
    }
    
    // GitHub raw content
    if (urlObj.hostname === 'github.com' && url.includes('/blob/')) {
      return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    
    // Return original URL if no conversion needed
    return url;
  } catch (error) {
    console.error('Error converting URL:', error);
    return url;
  }
}

/**
 * Validate if URL is from a trusted domain
 * @param {string} url - URL to validate
 * @returns {object} - Validation result with valid boolean and error message
 */
export function validateTrustedDomain(url) {
  const trustedDomains = [
    'res.cloudinary.com',
    'lh3.googleusercontent.com',
    'drive.google.com',
    'docs.google.com',
    'googleusercontent.com',
    'onedrive.live.com',
    '1drv.ms',
    'sharepoint.com',
    'dropbox.com',
    'dl.dropboxusercontent.com',
    'imgur.com',
    'i.imgur.com',
    'unsplash.com',
    'images.unsplash.com',
    'pexels.com',
    'images.pexels.com',
    'raw.githubusercontent.com',
    'github.com',
    'woxsen.edu.in',
    'amazonaws.com',
    'blob.core.windows.net'
  ];

  try {
    const urlObj = new URL(url);
    
    const isDomainTrusted = trustedDomains.some(domain => {
      return urlObj.hostname === domain || 
             urlObj.hostname.endsWith('.' + domain) ||
             urlObj.hostname.includes(domain);
    });

    if (!isDomainTrusted) {
      return { 
        valid: false, 
        error: 'Domain not in trusted list. Supported domains include: Google Drive, OneDrive, Dropbox, Imgur, Unsplash, Pexels, GitHub, and University domains.' 
      };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Get helpful instructions for getting direct image URLs from various services
 * @param {string} service - Service name
 * @returns {string} - Instructions for the service
 */
export function getImageUrlInstructions(service) {
  const instructions = {
    'google-drive': `
      Google Drive Instructions:
      1. Right-click on your image in Google Drive
      2. Select "Get link"
      3. Change permissions to "Anyone with the link can view"
      4. Copy and paste the link - it will be automatically converted
    `,
    'onedrive': `
      OneDrive Instructions:
      1. Right-click on your image in OneDrive
      2. Select "Share" or "Get a link"
      3. Choose "Anyone with the link can view"
      4. Copy and paste the link
    `,
    'dropbox': `
      Dropbox Instructions:
      1. Right-click on your image in Dropbox
      2. Select "Share" then "Create a link"
      3. Copy the sharing link - it will be automatically converted
    `,
    'imgur': `
      Imgur Instructions:
      1. Upload your image to imgur.com
      2. Right-click on the image and select "Copy image address"
      3. Use the direct image URL (ends with .jpg, .png, etc.)
    `,
    'github': `
      GitHub Instructions:
      1. Navigate to your image file in a GitHub repository
      2. Click on the image to view it
      3. Copy the URL - it will be automatically converted to raw content
    `
  };

  return instructions[service] || 'Ensure your link is a direct image URL or a shareable link from a supported service.';
}

/**
 * Check if a URL appears to be an image
 * @param {string} url - URL to check
 * @returns {boolean} - Whether URL appears to be an image
 */
export function isImageUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    
    // Check for image file extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => pathname.includes(ext));
    
    // Check for known image services that might not have extensions
    const imageServices = [
      'drive.google.com',
      'onedrive.live.com',
      'dropbox.com',
      'imgur.com',
      'unsplash.com',
      'pexels.com'
    ];
    const isKnownImageService = imageServices.some(service => 
      urlObj.hostname.includes(service)
    );
    
    return hasImageExtension || isKnownImageService;
  } catch (error) {
    return false;
  }
}

/**
 * Test if an image URL loads properly
 * @param {string} url - Image URL to test
 * @returns {Promise<boolean>} - Promise that resolves to true if image loads
 */
export function testImageLoad(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}
