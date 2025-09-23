'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const { isLoading, stopLoading } = useLoading();
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const originalTitleRef = useRef('');
  const titleIntervalRef = useRef(null);
  const faviconRef = useRef(null);

  // Animated title with loading dots
  useEffect(() => {
    if (isLoading) {
      originalTitleRef.current = document.title;
      let dots = 0;
      
      titleIntervalRef.current = setInterval(() => {
        dots = (dots + 1) % 4;
        const loadingDots = '.'.repeat(dots);
        const baseName = originalTitleRef.current.includes(' | ') 
          ? originalTitleRef.current.split(' | ').pop() 
          : originalTitleRef.current;
        document.title = `⏳ Loading${loadingDots} | ${baseName}`;
      }, 500);

      return () => {
        if (titleIntervalRef.current) {
          clearInterval(titleIntervalRef.current);
        }
        if (originalTitleRef.current) {
          document.title = originalTitleRef.current;
        }
      };
    }
  }, [isLoading]);

  // Simple emoji-based favicon animation (works in all browsers)
  useEffect(() => {
    if (isLoading) {
      // Try to create a simple spinning favicon
      try {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        faviconRef.current = link;
        
        // Store original
        const originalHref = link.href || '/favicon.ico';
        
        // Create simple data URI with blue circle
        const createLoadingFavicon = (rotation) => {
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          
          // Clear
          ctx.clearRect(0, 0, 64, 64);
          
          // Draw background circle
          ctx.beginPath();
          ctx.arc(32, 32, 28, 0, 2 * Math.PI);
          ctx.fillStyle = '#3b82f6';
          ctx.fill();
          
          // Draw rotating arc
          ctx.save();
          ctx.translate(32, 32);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, 1.5 * Math.PI);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.restore();
          
          return canvas.toDataURL();
        };
        
        let rotation = 0;
        const animate = () => {
          rotation = (rotation + 15) % 360;
          link.href = createLoadingFavicon(rotation);
          if (!document.head.contains(link)) {
            document.head.appendChild(link);
          }
        };
        
        const animationInterval = setInterval(animate, 100);
        
        return () => {
          clearInterval(animationInterval);
          link.href = originalHref;
        };
      } catch (error) {
        console.log('Favicon animation not supported:', error);
      }
    }
  }, [isLoading]);

  // Handle pathname changes
  useEffect(() => {
    if (pathname !== prevPathname) {
      setPrevPathname(pathname);
      stopLoading();
      setProgress(100);
      
      setTimeout(() => {
        setProgress(0);
      }, 300);
    }
  }, [pathname, prevPathname, stopLoading]);

  // Animate progress bar
  useEffect(() => {
    let interval;
    
    if (isLoading && progress < 90) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          const increment = prev < 30 ? 15 : prev < 60 ? 8 : 3;
          return Math.min(prev + increment, 90);
        });
      }, 200);
    } else if (!isLoading && progress < 100 && progress > 0) {
      setProgress(100);
      setTimeout(() => setProgress(0), 300);
    } else if (!isLoading) {
      setProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, progress]);

  return (
    <>
      {/* Top Loading Bar */}
      <div 
        className={`fixed top-0 left-0 w-full h-1 bg-transparent z-[100] transition-opacity duration-200 ${
          !isLoading && progress === 0 ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ top: '0px' }}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 transition-all duration-300 ease-out"
          style={{ 
            width: `${progress}%`,
            boxShadow: progress > 0 ? '0 0 20px rgba(59, 130, 246, 0.6)' : 'none',
          }}
        />
      </div>

      {/* Immediate Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-[1px] z-[99] pointer-events-none transition-opacity duration-150">
          <div className="absolute top-24 left-1/2 -translate-x-1/2">
            <div className="bg-white rounded-full p-4 shadow-xl border border-blue-100">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator Text */}
      {isLoading && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-[99] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border border-blue-100">
            <p className="text-sm font-medium text-blue-600 animate-pulse">Loading content...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingBar;