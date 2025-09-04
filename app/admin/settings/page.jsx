'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Navbar from '@/components/layout/Navbar';
import { 
  ArrowLeft, 
  Settings, 
  Globe,
  Mail,
  Shield,
  Database,
  Users,
  FileText,
  Save,
  RefreshCw
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState({
    siteName: 'Woxsen Insights',
    siteDescription: 'School of Business',
    adminEmail: '',
    allowRegistration: true,
    requireApproval: true,
    autoPublish: false,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }
    
    // Initialize with current values
    setSettings(prev => ({
      ...prev,
      adminEmail: session.user.email
    }));
  }, [session, status, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simulate saving settings (in real app, you'd create an API endpoint)
    setTimeout(() => {
      setMessage({ 
        type: 'success', 
        text: 'Settings saved successfully! Changes will take effect after server restart.' 
      });
      setLoading(false);
    }, 1000);
  };

  const systemInfo = {
    nextjsVersion: '15.5.2',
    nodeVersion: process.env.NODE_VERSION || 'Unknown',
    deploymentEnv: process.env.NODE_ENV || 'development',
    databaseStatus: 'Connected',
    lastBackup: 'Not configured'
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Platform Settings
          </h1>
          <p className="text-gray-600">
            Configure your Woxsen Insights platform settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                      Site Name
                    </label>
                    <Input
                      type="text"
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleInputChange}
                      placeholder="Enter site name"
                    />
                  </div>

                  <div>
                    <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <Textarea
                      id="siteDescription"
                      name="siteDescription"
                      value={settings.siteDescription}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Enter site description"
                    />
                  </div>

                  <div>
                    <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        id="adminEmail"
                        name="adminEmail"
                        value={settings.adminEmail}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="admin@woxsen.edu.in"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* User Management Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Allow User Registration</label>
                      <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                    </div>
                    <input
                      type="checkbox"
                      name="allowRegistration"
                      checked={settings.allowRegistration}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Require Admin Approval</label>
                      <p className="text-sm text-gray-500">New users must be approved by admin</p>
                    </div>
                    <input
                      type="checkbox"
                      name="requireApproval"
                      checked={settings.requireApproval}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Management Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Content Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Auto-Publish Blogs</label>
                      <p className="text-sm text-gray-500">Automatically publish approved blogs</p>
                    </div>
                    <input
                      type="checkbox"
                      name="autoPublish"
                      checked={settings.autoPublish}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                      <p className="text-sm text-gray-500">Enable maintenance mode for updates</p>
                    </div>
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  {settings.maintenanceMode && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Maintenance mode will prevent regular users from accessing the platform.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-end space-x-4">
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
          </div>

          {/* System Information Sidebar */}
          <div className="space-y-6">
            {/* System Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next.js Version</span>
                    <span className="text-sm font-medium">{systemInfo.nextjsVersion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Environment</span>
                    <span className={`text-sm font-medium ${
                      systemInfo.deploymentEnv === 'production' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {systemInfo.deploymentEnv}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database</span>
                    <span className="text-sm font-medium text-green-600">{systemInfo.databaseStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm font-medium text-gray-500">{systemInfo.lastBackup}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MongoDB</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NextAuth</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cloudinary</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
