'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const SmartImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  variant = 'full',
  naturalSize = false, // Re-added for featured images
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setIsLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 rounded-lg ${className}`} style={{ minHeight: '200px' }}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image failed to load</div>
        </div>
      </div>
    );
  }

  // For naturalSize, calculate responsive dimensions
  if (naturalSize && dimensions.width > 0) {
    const aspectRatio = dimensions.width / dimensions.height;
    const maxWidth = 800; // Max width for blog images
    let displayWidth = dimensions.width;
    let displayHeight = dimensions.height;
    
    if (displayWidth > maxWidth) {
      displayWidth = maxWidth;
      displayHeight = displayWidth / aspectRatio;
    }

    return (
      <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`} style={{ maxWidth: '100%' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse" style={{ height: '300px' }}>
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        
        <Image
          src={src}
          alt={alt}
          width={displayWidth}
          height={displayHeight}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } w-full h-auto`}
          priority={priority}
          quality={90}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
          {...props}
        />
      </div>
    );
  }

  // For regular images, use fill
  return (
    <div className={`relative w-full h-full overflow-hidden rounded-lg ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <div className="text-gray-400">Loading...</div>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        fill
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        priority={priority}
        quality={90}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
        {...props}
      />
    </div>
  );
};

export default SmartImage;