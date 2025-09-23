'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

/**
 * LoadingLink - A Link component that triggers loading state on click
 * Use this instead of Next.js Link for instant loading feedback
 */
const LoadingLink = ({ href, children, className, onClick, ...props }) => {
  const { startLoading } = useLoading();
  const pathname = usePathname();

  const handleClick = useCallback((e) => {
    // Only trigger loading if navigating to a different page
    if (href && href !== pathname && !href.startsWith('#')) {
      startLoading();
    }
    
    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }
  }, [href, pathname, startLoading, onClick]);

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default LoadingLink;
