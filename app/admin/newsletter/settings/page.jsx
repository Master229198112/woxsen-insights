'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const NewsletterSettings = () => {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState({
    general: {
      fromName: 'Woxsen Insights',
      fromEmail: 'insights@woxsen.edu.in',
      replyToEmail: 'noreply@woxsen.edu.in',
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
      includeBlogs: true,
      includeResearch: true,
      includeAchievements: true,
      includeEvents: true,
      includePatents: true,
      maxItemsPerSection: 5
    },
    branding: {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      logoUrl: '',
      footerText: 'Driving Innovation Through Knowledge'
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  // Load settings (in a real app, this would fetch from API)
  useEffect(() => {
    // Mock loading settings - in real app, fetch from database
    const loadSettings = () => {
      // Settings are already initialized with defaults
    };
    
    if (session) {
      loadSettings();
    }
  }, [session]);

  // Save settings
  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would save to the database
      // For now, we'll just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Save settings error:', error);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Update setting
  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // Test newsletter scheduling
  const testScheduling = async () => {
    try {
      const response = await fetch('/api/newsletter/scheduled?key=test-key');
      const data = await response.json();
      
      if (response.ok) {
        alert(`Scheduling Status: ${data.status}\nNext Week: ${data.nextWeekRange.start} to ${data.nextWeekRange.end}\nActive Subscribers: ${data.activeSubscribers}`);
      } else {
        alert(`Test failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Test scheduling error:', error);
      alert('Failed to test scheduling');
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletter Settings</h1>
        <p className="text-gray-600">Configure your newsletter preferences and automation settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                  <input
                    type="text"
                    value={settings.general.fromName}
                    onChange={(e) => updateSetting('general', 'fromName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                  <input
                    type="email"
                    value={settings.general.fromEmail}
                    onChange={(e) => updateSetting('general', 'fromEmail', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To Email</label>
                  <input
                    type="email"
                    value={settings.general.replyToEmail}
                    onChange={(e) => updateSetting('general', 'replyToEmail', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={settings.general.organizationName}
                    onChange={(e) => updateSetting('general', 'organizationName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automation Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Automation Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoSend"
                  checked={settings.automation.autoSendEnabled}
                  onChange={(e) => updateSetting('automation', 'autoSendEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="autoSend" className="text-sm font-medium text-gray-700">
                  Enable automatic weekly newsletter sending
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Send Day</label>
                  <select
                    value={settings.automation.sendDay}
                    onChange={(e) => updateSetting('automation', 'sendDay', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Send Time</label>
                  <input
                    type="time"
                    value={settings.automation.sendTime}
                    onChange={(e) => updateSetting('automation', 'sendTime', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
                  <select
                    value={settings.automation.timeZone}
                    onChange={(e) => updateSetting('automation', 'timeZone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Content Threshold
                  <span className="text-xs text-gray-500 ml-2">(minimum items needed to auto-send)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.automation.minContentThreshold}
                  onChange={(e) => updateSetting('automation', 'minContentThreshold', parseInt(e.target.value))}
                  className="w-full md:w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Content Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Settings</h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Choose which types of content to include in your newsletters:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.content.includeBlogs}
                      onChange={(e) => updateSetting('content', 'includeBlogs', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Blog Posts</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.content.includeResearch}
                      onChange={(e) => updateSetting('content', 'includeResearch', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Research Papers</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.content.includeAchievements}
                      onChange={(e) => updateSetting('content', 'includeAchievements', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Achievements</span>
                  </label>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.content.includeEvents}
                      onChange={(e) => updateSetting('content', 'includeEvents', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Events</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.content.includePatents}
                      onChange={(e) => updateSetting('content', 'includePatents', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Patents</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Items per Section
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.content.maxItemsPerSection}
                  onChange={(e) => updateSetting('content', 'maxItemsPerSection', parseInt(e.target.value))}
                  className="w-full md:w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Branding Settings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
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
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
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
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={settings.branding.logoUrl}
                  onChange={(e) => updateSetting('branding', 'logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
                <textarea
                  value={settings.branding.footerText}
                  onChange={(e) => updateSetting('branding', 'footerText', e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save Button */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : saved ? (
                <>
                  <span>✅</span>
                  Settings Saved!
                </>
              ) : (
                <>
                  <span>💾</span>
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={testScheduling}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                <span>🔧</span>
                Test Scheduling
              </button>
              
              <button
                onClick={() => window.open('/api/newsletter/preview', '_blank')}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <span>👁️</span>
                Preview Template
              </button>
            </div>
          </div>

          {/* Current Config Info */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Auto-Send:</span>
                <span className={settings.automation.autoSendEnabled ? 'text-green-600 font-medium' : 'text-red-600'}>
                  {settings.automation.autoSendEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Send Schedule:</span>
                <span>{settings.automation.sendDay}s at {settings.automation.sendTime}</span>
              </div>
              <div className="flex justify-between">
                <span>Content Threshold:</span>
                <span>{settings.automation.minContentThreshold} items</span>
              </div>
              <div className="flex justify-between">
                <span>Time Zone:</span>
                <span>{settings.automation.timeZone}</span>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Environment Setup</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>Make sure these are configured:</p>
              <ul className="mt-2 space-y-1">
                <li>• SENDGRID_API_KEY</li>
                <li>• NEWSLETTER_CRON_KEY</li>
                <li>• NEWSLETTER_AUTO_SEND</li>
                <li>• MIN_NEWSLETTER_CONTENT</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSettings;
