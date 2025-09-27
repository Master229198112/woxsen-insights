// Debug page to monitor API calls and identify sources of excessive requests
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function APIMon() {
  const [logs, setLogs] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    totalCalls: 0,
    notificationCalls: 0,
    duplicateComponents: 0,
    tabsOpen: 0
  });
  const originalFetch = useRef(null);

  useEffect(() => {
    // Store original fetch
    if (!originalFetch.current) {
      originalFetch.current = window.fetch;
    }

    if (isMonitoring) {
      // Monitor fetch calls
      window.fetch = async (...args) => {
        const [url, options = {}] = args;
        const timestamp = new Date().toISOString();
        const method = options.method || 'GET';
        
        // Track API calls
        if (url.includes('/api/')) {
          const logEntry = {
            id: Date.now() + Math.random(),
            timestamp,
            url: url.toString(),
            method,
            stackTrace: new Error().stack.split('\n').slice(2, 5),
            tabActive: !document.hidden,
            userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'
          };

          setLogs(prev => [logEntry, ...prev.slice(0, 49)]); // Keep last 50
          
          // Update stats
          setStats(prev => ({
            ...prev,
            totalCalls: prev.totalCalls + 1,
            notificationCalls: url.includes('/api/notifications') 
              ? prev.notificationCalls + 1 
              : prev.notificationCalls
          }));
        }

        return originalFetch.current(...args);
      };

      // Check for duplicate components
      const checkDuplicates = () => {
        const bellComponents = document.querySelectorAll('[data-component="notification-bell"]');
        const duplicates = bellComponents.length > 1 ? bellComponents.length : 0;
        
        setStats(prev => ({
          ...prev,
          duplicateComponents: duplicates,
          tabsOpen: navigator.webkitVisibilityState === 'visible' ? 1 : 0
        }));
      };

      const interval = setInterval(checkDuplicates, 5000);
      checkDuplicates();

      return () => {
        clearInterval(interval);
      };
    } else {
      // Restore original fetch
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
    }
  }, [isMonitoring]);

  const clearLogs = () => {
    setLogs([]);
    setStats({
      totalCalls: 0,
      notificationCalls: 0,
      duplicateComponents: 0,
      tabsOpen: 0
    });
  };

  const exportLogs = () => {
    const data = {
      stats,
      logs: logs.slice(0, 20),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Monitor & Debug</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "destructive" : "default"}
          >
            {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </Button>
          <Button onClick={clearLogs} variant="outline">Clear Logs</Button>
          <Button onClick={exportLogs} variant="outline">Export Data</Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalCalls}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Notification Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.notificationCalls}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Duplicate Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.duplicateComponents > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.duplicateComponents}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tab Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={document.hidden ? "destructive" : "default"}>
              {document.hidden ? "Hidden" : "Active"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            API Monitoring {isMonitoring ? 'Active' : 'Inactive'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isMonitoring && (
            <p className="text-gray-600">Click "Start Monitoring" to track API calls and identify sources of excessive requests.</p>
          )}
          {isMonitoring && (
            <div className="space-y-2">
              <p className="text-green-600">✅ Monitoring all fetch() requests to /api/ endpoints</p>
              <p className="text-blue-600">📊 Tracking duplicate components and tab activity</p>
              <p className="text-orange-600">🔍 Recording stack traces for debugging</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Logs */}
      {isMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle>Live API Call Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 && (
                <p className="text-gray-500 text-center py-8">No API calls detected yet...</p>
              )}
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className={`p-3 border rounded text-sm ${
                    log.url.includes('notifications') ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.method === 'GET' ? 'default' : 'secondary'}>
                        {log.method}
                      </Badge>
                      <span className="font-mono text-xs">{log.url}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={log.tabActive ? 'default' : 'destructive'}>
                        {log.tabActive ? 'Active' : 'Hidden'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer hover:text-gray-800">Stack Trace</summary>
                    <pre className="mt-1 whitespace-pre-wrap">{log.stackTrace.join('\n')}</pre>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Debug Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => {
                window.DEBUG_NOTIFICATIONS = !window.DEBUG_NOTIFICATIONS;
                console.log('🔔 Debug notifications:', window.DEBUG_NOTIFICATIONS);
              }}
              variant="outline"
            >
              Toggle Notification Debug
            </Button>
            
            <Button 
              onClick={() => {
                console.log('🔍 Component scan:');
                console.log('Notification bells:', document.querySelectorAll('[data-component="notification-bell"]').length);
                console.log('Smart polling hooks:', document.querySelectorAll('[data-smart-polling]').length);
                console.log('Active tabs:', !document.hidden);
              }}
              variant="outline"
            >
              Scan Components
            </Button>
            
            <Button 
              onClick={() => {
                // Force garbage collection if available
                if (window.gc) {
                  window.gc();
                  console.log('🧹 Forced garbage collection');
                } else {
                  console.log('⚠️ Garbage collection not available');
                }
              }}
              variant="outline"
            >
              Force Cleanup
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 space-y-1">
            <p>• <strong>Toggle Notification Debug:</strong> Enable/disable verbose logging for notifications</p>
            <p>• <strong>Scan Components:</strong> Check for duplicate components that might cause extra API calls</p>
            <p>• <strong>Force Cleanup:</strong> Attempt to clean up memory (requires --js-flags=--expose-gc)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}