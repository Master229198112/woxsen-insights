'use client';

import { useState } from 'react';

const NewsletterSubscription = ({ 
  title = "Stay Updated with Woxsen Insights",
  description = "Get weekly updates on research, achievements, and academic insights.",
  placeholder = "Enter your email address",
  className = "",
  compact = false,
  source = "blog-sidebar",
  showPreferences = false
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [preferences, setPreferences] = useState({
    weeklyDigest: true,
    achievements: true,
    publications: true,
    events: true,
    research: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email address');
      setIsSuccess(false);
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          source,
          ...(showPreferences && { preferences })
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        setEmail('');
        
        // Track subscription event (optional analytics)
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'newsletter_subscribe', {
            event_category: 'engagement',
            event_label: source,
            value: 1
          });
        }
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (preference) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border ${className}`}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
        
        {message && (
          <div className={`mt-2 text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {showPreferences && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">What would you like to receive?</p>
            <div className="space-y-1">
              {[
                { key: 'weeklyDigest', label: 'Weekly Digest' },
                { key: 'achievements', label: 'Community Achievements' },
                { key: 'publications', label: 'New Publications' },
                { key: 'events', label: 'Upcoming Events' },
                { key: 'research', label: 'Research Updates' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={() => handlePreferenceChange(key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subscribing...
            </>
          ) : (
            <>
              <span className="mr-2">📧</span>
              Subscribe to Newsletter
            </>
          )}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          isSuccess 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          By subscribing, you agree to receive emails from Woxsen Insights. 
          You can unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default NewsletterSubscription;
