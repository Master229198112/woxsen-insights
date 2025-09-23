'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    
    // Safety timeout: auto-stop loading after 10 seconds
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 10000);
    
    setLoadingTimeout(timeout);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }, [loadingTimeout]);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
