'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import { AlertTriangle, Wifi, WifiOff, RefreshCw, Eye, Users, Activity } from 'lucide-react';

export default function DebugPage() {
  const [apiCalls, setApiCalls] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    lastMinute: 0,
    notifications: 0,
    other: 0
  });
  // State to safely track if the tab is hidden
  const [isTabHidden, setIsTabHidden] = useState(false);
  
  const originalFetch = useRef(null);
  const startTime = useRef(Date.now());

  // Effect to safely handle document visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };
    // Set initial state
    handleVisibilityChange();
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !originalFetch.current) {
      originalFetch.current = window.fetch;
      
      window.fetch = async (...args) => {
        const [url, options] = args;
        const urlString = url.toString();
        const isApiCall = urlString.includes('/api/');
        
        const responsePromise = originalFetch.current(...args);

        if (isApiCall && isMonitoring) {
          const callInfo = {
            id: Date.now() + Math.random(),
            url: urlString,
            method: options?.method || 'GET',
            timestamp: new Date().toISOString(),
            time: Date.now()
          };
          
          setApiCalls(prev => [callInfo, ...prev.slice(0, 49)]);
        }
        
        return responsePromise;
      };
    }
    
    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
        originalFetch.current = null; // Clear ref on cleanup
      }
    };
  }, [isMonitoring]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      setStats({
        total: apiCalls.length,
        lastMinute: apiCalls.filter(call => call.time > oneMinuteAgo).length,
        notifications: apiCalls.filter(call => call.url.includes('/notifications')).length,
        other: apiCalls.filter(call => !call.url.includes('/notifications')).length
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [apiCalls]);

  const toggleMonitoring = () => {
    const nextIsMonitoring = !isMonitoring;
    setIsMonitoring(nextIsMonitoring);
    if (nextIsMonitoring) {
      setApiCalls([]);
      startTime.current = Date.now();
    }
  };

  const clearCalls = () => {
    setApiCalls([]);
    startTime.current = Date.now();
  };
  
  const getCallFrequency = () => {
    if (apiCalls.length < 2) return 'N/A';
    const intervals = [];
    for (let i = 0; i < Math.min(apiCalls.length - 1, 10); i++) {
      intervals.push(apiCalls[i].time - apiCalls[i + 1].time);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return `${Math.round(avg / 1000)}s avg`;
  };

  const getUniqueUrls = () => {
    return [...new Set(apiCalls.map(call => call.url))].slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">API Call Monitor</h1>
              <p className="text-gray-600">Debug high CPU usage by monitoring API calls in real-time</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={toggleMonitoring}
                className={`flex items-center space-x-2 ${
                  isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isMonitoring ? (
                  <>
                    <Activity className="h-4 w-4 animate-pulse" />
                    <span>Stop Monitoring</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Start Monitoring</span>
                  </>
                )}
              </Button>
              
              <Button onClick={clearCalls} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total API Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className={`h-8 w-8 ${stats.lastMinute > 5 ? 'text-red-600' : 'text-green-600'}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Minute</p>
                  <p className={`text-2xl font-bold ${stats.lastMinute > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.lastMinute}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wifi className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.notifications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Call Frequency</p>
                  <p className="text-lg font-bold text-gray-900">{getCallFrequency()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {isMonitoring ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span>Monitoring Active</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-gray-500" />
                  <span>Monitoring Stopped</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Running Time</h4>
                <p className="text-sm text-gray-600">
                  {isMonitoring ? Math.round((Date.now() - startTime.current) / 1000) : 0}s since start
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Rate Limit Alert</h4>
                <p className={`text-sm ${
                  stats.lastMinute > 10 ? 'text-red-600 font-medium' : 'text-green-600'
                }`}>
                  {stats.lastMinute > 10 ? '⚠️ High frequency detected!' : '✅ Normal frequency'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Browser Tab</h4>
                <p className={`text-sm ${
                  isTabHidden ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {isTabHidden ? '🔶 Tab is hidden' : '🟢 Tab is active'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unique URLs */}
        {getUniqueUrls().length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>API Endpoints Called</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getUniqueUrls().map((url, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-mono">{url}</span>
                    <span className="text-xs text-gray-500">
                      {apiCalls.filter(call => call.url === url).length} calls
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent API Calls */}
        <Card>
          <CardHeader>
            <CardTitle>Recent API Calls (Last 50)</CardTitle>
          </CardHeader>
          <CardContent>
            {apiCalls.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>{isMonitoring ? 'Waiting for API calls...' : 'Start monitoring to see API calls'}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {apiCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 bg-gray-50 rounded text-sm">
                    <div className="flex-1">
                      <div className="font-mono text-xs text-blue-600 break-all">{call.url}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(call.timestamp).toLocaleTimeString()} • {call.method}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pl-4">
                      {Math.round((Date.now() - call.time) / 1000)}s ago
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
