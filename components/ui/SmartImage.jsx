'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const SmartImage = ({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  variant = 'full', // 'full', 'card', 'thumbnail', 'natural'
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    const img = new window.Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 rounded-lg ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">Image failed to load</div>
        </div>
      </div>
    );
  }

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