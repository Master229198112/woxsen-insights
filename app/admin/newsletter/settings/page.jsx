'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Settings,
  Mail,
  Clock,
  Palette,
  FileText,
  Save,
  TestTube,
  Eye,
  AlertCircle,
  CheckCircle,
  Zap,
  Shield
} from 'lucide-react';

export default function NewsletterSettings() {
  const [settings, setSettings] = useState({
    general: {
      fromName: 'Woxsen Insights',
      fromEmail: 'sob.insights@woxsen.edu.in',
      replyToEmail: 'sob.insights@woxsen.edu.in',
      organizationName: 'Woxsen University'
    },
    automation: {
      autoSendEnabled: false,
      sendDay: 'monday',
      sendTime: '09:00',
      minContentThreshold: 3,
      timeZone: 'Asia/Kolkata'
    },
    content: {
      includeResearch: true,
      includeAchievements: true,
      includeEvents: true,
      includePatents: true,
      includeBlogs: true,
      includeIndustryCollaborations: true,
      maxItemsPerSection: 5
    },
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      logoUrl: '',
      footerText: 'Driving Innovation Through Knowledge'
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/newsletter/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(prev => ({
            ...prev,
            ...data.settings
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Keep default settings if API fails
      }
    };
    
    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/newsletter/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const testScheduling = async () => {
    try {
      setTestResult({ type: 'loading', message: 'Testing newsletter scheduling...' });
      
      const response = await fetch('/api/newsletter/scheduled?key=test-key');
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({
          type: 'success',
          message: `Scheduling Test Successful`,
          details: {
            status: data.status,
            nextWeek: `${data.nextWeekRange.start} to ${data.nextWeekRange.end}`,
            activeSubscribers: data.activeSubscribers,
            contentAvailable: data.contentCount || 0
          }
        });
      } else {
        setTestResult({
          type: 'error',
          message: `Test failed: ${data.error}`
        });
      }
    } catch (error) {
      console.error('Test scheduling error:', error);
      setTestResult({
        type: 'error',
        message: 'Failed to test scheduling. Check your configuration.'
      });
    }
  };

  const testNewsletter = async () => {
    try {
      setTestResult({ type: 'loading', message: 'Sending test newsletter...' });
      
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send-test'
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestResult({
          type: 'success',
          message: `Test newsletter sent successfully`,
          details: {
            sentTo: data.sentTo || 'Test email',
            timestamp: new Date().toLocaleString()
          }
        });
      } else {
        setTestResult({
          type: 'error',
          message: `Failed to send test: ${data.error}`
        });
      }
    } catch (error) {
      console.error('Test newsletter error:', error);
      setTestResult({
        type: 'error',
        message: 'Failed to send test newsletter. Check your email configuration.'
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Settings</h1>
        <p className="text-gray-600">Configure your newsletter preferences and automation settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.general.fromName}
                    onChange={(e) => updateSetting('general', 'fromName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={settings.general.fromEmail}
                    onChange={(e) => updateSetting('general', 'fromEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reply-To Email</label>
                  <input
                    type="email"
                    value={settings.general.replyToEmail}
                    onChange={(e) => updateSetting('general', 'replyToEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={settings.general.organizationName}
                    onChange={(e) => updateSetting('general', 'organizationName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="autoSend"
                  checked={settings.automation.autoSendEnabled}
                  onChange={(e) => updateSetting('automation', 'autoSendEnabled', e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <label htmlFor="autoSend" className="text-sm font-medium text-gray-700">
                    Enable automatic weekly newsletter sending
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled, newsletters will be automatically sent based on the schedule below
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send Day</label>
                  <select
                    value={settings.automation.sendDay}
                    onChange={(e) => updateSetting('automation', 'sendDay', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send Time</label>
                  <input
                    type="time"
                    value={settings.automation.sendTime}
                    onChange={(e) => updateSetting('automation', 'sendTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                  <select
                    value={settings.automation.timeZone}
                    onChange={(e) => updateSetting('automation', 'timeZone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Content Threshold
                  <span className="text-xs text-gray-500 ml-2">(minimum items needed to auto-send)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.automation.minContentThreshold}
                  onChange={(e) => updateSetting('automation', 'minContentThreshold', parseInt(e.target.value))}
                  className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">Choose which types of content to include in your newsletters:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {[
                    { key: 'includeResearch', label: 'Research & Publications', desc: 'Academic papers and research findings' },
                    { key: 'includeAchievements', label: 'Achievements', desc: 'Awards, recognitions, and milestones' },
                    { key: 'includeEvents', label: 'Events', desc: 'Conferences, seminars, and workshops' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={settings.content[item.key]}
                        onChange={(e) => updateSetting('content', item.key, e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  {[
                    { key: 'includePatents', label: 'Patents & Innovation', desc: 'Patents, IP, and technological advances' },
                    { key: 'includeBlogs', label: 'Blog Posts', desc: 'Thought leadership and insights' },
                    { key: 'includeIndustryCollaborations', label: 'Industry Collaborations', desc: 'Partnerships and joint initiatives' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={settings.content[item.key]}
                        onChange={(e) => updateSetting('content', item.key, e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Items per Section
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.content.maxItemsPerSection}
                  onChange={(e) => updateSetting('content', 'maxItemsPerSection', parseInt(e.target.value))}
                  className="w-full md:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Branding Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={(e) => updateSetting('branding', 'primaryColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.branding.primaryColor}
                      onChange={(e) => updateSetting('branding', 'primaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.branding.secondaryColor}
                      onChange={(e) => updateSetting('branding', 'secondaryColor', e.target.value)}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.branding.secondaryColor}
                      onChange={(e) => updateSetting('branding', 'secondaryColor', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={settings.branding.logoUrl}
                  onChange={(e) => updateSetting('branding', 'logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                <textarea
                  value={settings.branding.footerText}
                  onChange={(e) => updateSetting('branding', 'footerText', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save Button */}
          <Card>
            <CardContent className="p-6">
              <Button
                onClick={saveSettings}
                disabled={loading}
                className="w-full mb-4"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Settings Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>

              {saved && (
                <div className="text-center text-sm text-green-600">
                  Configuration updated successfully
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={testScheduling}
                variant="outline"
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Scheduling
              </Button>
              
              <Button
                onClick={testNewsletter}
                variant="outline"
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Test Newsletter
              </Button>
              
              <Button
                onClick={() => window.open('/api/newsletter/preview', '_blank')}
                variant="outline"
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Template
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {testResult.type === 'loading' && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>}
                  {testResult.type === 'success' && <CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
                  {testResult.type === 'error' && <AlertCircle className="h-5 w-5 mr-2 text-red-600" />}
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-3 rounded-lg ${
                  testResult.type === 'success' ? 'bg-green-50 text-green-800' :
                  testResult.type === 'error' ? 'bg-red-50 text-red-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
                  <p className="font-medium">{testResult.message}</p>
                  {testResult.details && (
                    <div className="mt-2 text-sm space-y-1">
                      {Object.entries(testResult.details).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</strong> {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Config Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Current Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Auto-Send:</span>
                  <span className={`font-medium ${settings.automation.autoSendEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.automation.autoSendEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="font-medium">{settings.automation.sendDay}s at {settings.automation.sendTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Content Threshold:</span>
                  <span className="font-medium">{settings.automation.minContentThreshold} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Zone:</span>
                  <span className="font-medium">{settings.automation.timeZone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From Email:</span>
                  <span className="font-medium text-xs">{settings.general.fromEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Environment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Email Service', status: 'active', desc: 'Office365 SMTP' },
                  { name: 'Database', status: 'active', desc: 'MongoDB Connected' },
                  { name: 'Cron Jobs', status: 'active', desc: 'Scheduler Ready' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600 font-medium">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}