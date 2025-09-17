'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, Clock } from 'lucide-react';

export default function MaintenancePage() {
  const [message, setMessage] = useState('We are currently performing scheduled maintenance. Please check back soon.');

  useEffect(() => {
    // Fetch maintenance message from public API
    const fetchMessage = async () => {
      try {
        const response = await fetch('/api/maintenance-status');
        if (response.ok) {
          const { maintenanceMessage } = await response.json();
          if (maintenanceMessage) {
            setMessage(maintenanceMessage);
          }
        }
      } catch (error) {
        console.error('Failed to fetch maintenance message:', error);
      }
    };

    fetchMessage();

    // Check every 30 seconds if maintenance is over
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/maintenance-status');
        if (response.ok) {
          const { maintenanceMode } = await response.json();
          if (!maintenanceMode) {
            window.location.href = '/';
          }
        }
      } catch (error) {
        console.error('Maintenance check error:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Under Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>We'll be back shortly</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
