'use client';

import { useLoading } from '@/contexts/LoadingContext';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

export default function Link({ href, children, onClick, className, ...props }) {
  const { startLoading } = useLoading();
  const pathname = usePathname();

  const handleClick = (e) => {
    // Check if it's a different route
    const targetPath = typeof href === 'string' ? href : href.pathname;
    
    // Only start loading if navigating to a different page
    if (targetPath !== pathname) {
      startLoading();
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <NextLink 
      href={href} 
      onClick={handleClick} 
      className={className}
      {...props}
    >
      {children}
    </NextLink>
  );
}