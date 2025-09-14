'use client';
import React from 'react';

const LoadingSpinner = ({ 
  size = 'default', 
  text = '', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-6 h-6', 
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          border-2 border-blue-600 border-t-transparent 
          rounded-full animate-spin
        `}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
