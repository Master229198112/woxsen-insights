'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const LoadingBar = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let timeout;
    let interval;

    const startLoading = () => {
      setLoading(true);
      setProgress(0);
      
      // Simulate loading progress
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 30;
        });
      }, 100);

      // Complete loading after a short delay
      timeout = setTimeout(() => {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 200);
      }, 800);
    };

    const finishLoading = () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    };

    // Listen for route changes
    const handleStart = () => startLoading();
    const handleComplete = () => finishLoading();

    // Check if we need to show loading (this is a simple approach)
    // In a real app, you might want to use router events or other indicators
    let timeoutId;
    
    const checkLoading = () => {
      // Start loading when pathname changes
      startLoading();
    };

    // Start loading on pathname change
    checkLoading();

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50" style={{ top: '64px' }}>
      <div 
        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          boxShadow: progress > 0 ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none'
        }}
      />
    </div>
  );
};

export default LoadingBar;
