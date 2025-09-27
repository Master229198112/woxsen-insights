import { useEffect, useRef, useState } from 'react';

// Global tracking to prevent multiple instances
const globalPollingInstances = new Set();

/**
 * Smart Polling Hook
 * Only polls when the browser tab is active to reduce CPU usage
 * Prevents multiple instances with same callback
 * 
 * @param {Function} callback - Function to call on each poll
 * @param {number} interval - Polling interval in milliseconds (default: 2 minutes)
 * @param {boolean} enabled - Whether polling is enabled
 * @returns {Object} - { isActive, isPolling, forceUpdate }
 */
export const useSmartPolling = (callback, interval = 120000, enabled = true) => {
  const intervalRef = useRef(null);
  const [isActive, setIsActive] = useState(!document.hidden);
  const [lastPollTime, setLastPollTime] = useState(null);
  const callbackRef = useRef(callback);
  const instanceId = useRef(`polling-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [isPolling, setIsPolling] = useState(false);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const startPolling = () => {
    // Check for emergency disable flag
    if (!enabled || intervalRef.current || window.SMART_POLLING_DISABLED) return;
    
    if (process.env.NODE_ENV === 'development' && window.DEBUG_SMART_POLLING) {
      console.log('🔄 [Smart Polling] Starting...', { 
        instanceId: instanceId.current,
        interval: `${interval/1000}s`,
        enabled,
        tabActive: !document.hidden 
      });
    }
    
    // Register this instance
    globalPollingInstances.add(instanceId.current);
    
    intervalRef.current = setInterval(() => {
      if (!document.hidden) {
        if (process.env.NODE_ENV === 'development' && window.DEBUG_SMART_POLLING) {
          console.log('📡 [Smart Polling] Executing...', {
            instanceId: instanceId.current,
            timestamp: new Date().toISOString()
          });
        }
        callbackRef.current();
        setLastPollTime(new Date());
      }
    }, interval);
    
    setIsPolling(true);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPolling(false);
      
      // Unregister this instance
      globalPollingInstances.delete(instanceId.current);
      
      if (process.env.NODE_ENV === 'development' && window.DEBUG_SMART_POLLING) {
        console.log('⏹️ [Smart Polling] Stopped', {
          instanceId: instanceId.current,
          remainingInstances: globalPollingInstances.size
        });
      }
    }
  };

  const forceUpdate = () => {
    if (process.env.NODE_ENV === 'development' && window.DEBUG_SMART_POLLING) {
      console.log('🔄 [Smart Polling] Force update triggered', {
        instanceId: instanceId.current
      });
    }
    callbackRef.current();
    setLastPollTime(new Date());
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      const tabIsVisible = !document.hidden;
      setIsActive(tabIsVisible);

      if (!tabIsVisible) {
        // Tab is hidden - stop polling
        stopPolling();
        if (process.env.NODE_ENV === 'development' && window.DEBUG_SMART_POLLING) {
          console.log('🔄 [Smart Polling] Paused (tab inactive)', {
            instanceId: instanceId.current
          });
        }
      } else if (enabled) {
        // Tab is active - resume polling and fetch immediately
        if (process.env.NODE_ENV === 'development' && window.DEBUG_SMART_POLLING) {
          console.log('🔄 [Smart Polling] Resumed (tab active)', {
            instanceId: instanceId.current
          });
        }
        
        // Immediate fetch when tab becomes active
        callbackRef.current();
        setLastPollTime(new Date());
        
        // Start polling
        startPolling();
      }
    };

    // Initial setup
    if (enabled && isActive) {
      callbackRef.current(); // Initial call
      setLastPollTime(new Date());
      startPolling();
    }

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [interval, enabled, isActive]);

  // Debug effect to log global instances
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && window.DEBUG_SMART_POLLING) {
      console.log('🔄 [Smart Polling] Global instances:', {
        total: globalPollingInstances.size,
        instances: Array.from(globalPollingInstances),
        current: instanceId.current
      });
    }
  }, [isPolling]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (process.env.NODE_ENV === 'development' && window.DEBUG_SMART_POLLING) {
        console.log('🔄 [Smart Polling] Component unmounted', {
          instanceId: instanceId.current
        });
      }
    };
  }, []);

  return { 
    isActive, 
    isPolling, 
    forceUpdate,
    lastPollTime,
    instanceId: instanceId.current
  };
};