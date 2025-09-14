'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const SmartImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  maxHeight = 600,
  minHeight = 300,
  variant = 'full', // 'full', 'card', 'thumbnail', 'natural'
  naturalSize = false, // If true, displays at original dimensions
  ...props 
}) => {
  const [imageOrientation, setImageOrientation] = useState('unknown');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const imgRef = useRef(null);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!src) return;

    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      
      // Determine orientation with better thresholds
      const aspectRatio = naturalWidth / naturalHeight;
      if (aspectRatio > 1.1) {
        setImageOrientation('landscape');
      } else if (aspectRatio < 0.9) {
        setImageOrientation('portrait');
      } else {
        setImageOrientation('square');
      }
      
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
    
    img.src = src;
  }, [src]);

  // Calculate optimal container dimensions (simplified for hydration)
  const getContainerStyle = () => {
    // For natural sizing, use the image's actual dimensions
    if ((naturalSize || variant === 'natural') && isMounted && imageDimensions.width > 0) {
      // Calculate responsive dimensions while maintaining aspect ratio
      const aspectRatio = imageDimensions.width / imageDimensions.height;
      const maxWidthPx = 800; // Keep consistent max width
      
      let displayWidth = imageDimensions.width;
      let displayHeight = imageDimensions.height;
      
      // Scale down if image is wider than container
      if (displayWidth > maxWidthPx) {
        displayWidth = maxWidthPx;
        displayHeight = displayWidth / aspectRatio;
      }
      
      return {
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
        maxWidth: '100%'
      };
    }
    
    // Default container styles (stable for SSR)
    if (naturalSize || variant === 'natural') {
      return { width: '100%', minHeight: '300px' };
    }
    
    if (imageOrientation === 'unknown' || !imageDimensions.width) {
      return { height: `${minHeight}px` };
    }

    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    // Handle different variants
    if (variant === 'card') {
      // For card thumbnails, use fixed dimensions
      return { 
        height: '96px', // h-24 equivalent
        width: '128px'  // w-32 equivalent
      };
    }
    
    if (variant === 'thumbnail') {
      return {
        height: '64px', // h-16 equivalent
        width: '64px'   // w-16 equivalent
      };
    }
    
    // For full variant, use responsive sizing
    switch (imageOrientation) {
      case 'landscape':
        // For landscape images, use a reasonable fixed height
        return { 
          height: `${Math.min(maxHeight * 0.7, 400)}px`,
          maxHeight: `${maxHeight}px`
        };
      
      case 'portrait':
        // For portrait images, use a responsive approach that shows the full image
        const portraitHeight = Math.min(maxHeight * 1.2, 600);
        return { 
          height: `${portraitHeight}px`,
          maxHeight: `${maxHeight * 1.2}px`
        };
      
      case 'square':
        // For square images, use balanced dimensions
        return { 
          height: `${Math.min(maxHeight * 0.8, 450)}px`,
          maxHeight: `${maxHeight}px`
        };
      
      default:
        return { height: `${minHeight}px` };
    }
  };

  // Get appropriate object-fit strategy
  const getObjectFit = () => {
    // For natural sizing, always use 'contain' to show full image (after mount)
    if ((naturalSize || variant === 'natural') && isMounted) {
      return 'contain';
    }
    
    // Default to cover for stable SSR
    if (naturalSize || variant === 'natural') {
      return 'cover';
    }
    
    // For card and thumbnail variants, always use cover
    if (variant === 'card' || variant === 'thumbnail') {
      return 'cover';
    }
    
    // For full variant, use smart object-fit
    switch (imageOrientation) {
      case 'landscape':
        return 'cover';
      case 'portrait':
        return 'contain'; // Use contain for portrait to show full image
      case 'square':
        return 'cover';
      default:
        return 'cover';
    }
  };

  // Get background color for contain mode
  const getBackgroundColor = () => {
    // Add background for natural sizing (after mount) or portrait images in full variant
    if ((naturalSize || variant === 'natural') && isMounted) {
      return 'bg-white';
    }
    // Default for natural sizing during SSR
    if (naturalSize || variant === 'natural') {
      return 'bg-gray-50';
    }
    return imageOrientation === 'portrait' && variant === 'full' ? 'bg-gradient-to-b from-gray-50 to-gray-100' : '';
  };

  if (error) {
    const errorHeight = (naturalSize || variant === 'natural') ? '300px' : `${minHeight}px`;
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 rounded-lg ${className}`}
        style={{ height: errorHeight, width: '100%' }}
      >
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image failed to load</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${getBackgroundColor()} ${className}`} suppressHydrationWarning>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse"
          style={(naturalSize || variant === 'natural') ? { height: '300px', width: '100%' } : { height: `${minHeight}px` }}
        >
          <div className="text-gray-400">Loading...</div>
        </div>
      )}
      
      <div 
        className="relative w-full"
        style={getContainerStyle()}
        suppressHydrationWarning
      >
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          fill={!(naturalSize || variant === 'natural') || !isMounted || !imageDimensions.width}
          width={(naturalSize || variant === 'natural') && isMounted && imageDimensions.width ? imageDimensions.width : undefined}
          height={(naturalSize || variant === 'natural') && isMounted && imageDimensions.height ? imageDimensions.height : undefined}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${(naturalSize || variant === 'natural') && isMounted && imageDimensions.width ? 'w-full h-auto' : ''}`}
          style={{ 
            objectFit: getObjectFit(),
            objectPosition: 'center'
          }}
          priority={priority}
          quality={90}
          sizes={(naturalSize || variant === 'natural') 
            ? "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
            : "(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
          }
          {...props}
        />
        
        {/* Orientation indicator for development (remove in production) */}
        {false && process.env.NODE_ENV === 'development' && imageOrientation !== 'unknown' && variant === 'full' && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {imageOrientation} ({imageDimensions.width}×{imageDimensions.height})
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartImage;