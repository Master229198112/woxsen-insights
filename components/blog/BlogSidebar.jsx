'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Eye, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const BlogSidebar = ({ relatedBlogs, currentCategory }) => {
  const [email, setEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState(''); // '', 'loading', 'success', 'error'
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  const categories = [
    { name: 'Research', href: '/category/research', color: 'bg-blue-100 text-blue-800' },
    { name: 'Achievements', href: '/category/achievements', color: 'bg-green-100 text-green-800' },
    { name: 'Publications', href: '/category/publications', color: 'bg-purple-100 text-purple-800' },
    { name: 'Events', href: '/category/events', color: 'bg-orange-100 text-orange-800' },
    { name: 'Patents', href: '/category/patents', color: 'bg-pink-100 text-pink-800' },
    { name: 'Case Studies', href: '/category/case-studies', color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Blogs', href: '/category/blogs', color: 'bg-red-100 text-red-800' },
    { name: 'Industry Collaborations', href: '/category/industry-collaborations', color: 'bg-cyan-100 text-cyan-800' },
  ];

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setSubscriptionStatus('error');
      setSubscriptionMessage('Please enter a valid email address');
      return;
    }

    setSubscriptionStatus('loading');
    setSubscriptionMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscriptionStatus('success');
        setSubscriptionMessage('Successfully subscribed! You\'ll receive weekly updates.');
        setEmail('');
      } else {
        setSubscriptionStatus('error');
        setSubscriptionMessage(data.error || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setSubscriptionStatus('error');
      setSubscriptionMessage('Network error. Please check your connection.');
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setSubscriptionStatus('');
      setSubscriptionMessage('');
    }, 5000);
  };

  return (
    <div className="space-y-8">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => {
              const categoryKey = category.name.toLowerCase().replace(/\s+/g, '-');
              const isActive = currentCategory === categoryKey || 
                             currentCategory === category.name.toLowerCase();
              
              return (
                <Link 
                  key={category.name} 
                  href={category.href}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Related Posts */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatedBlogs.map((blog) => (
                <Link 
                  key={blog._id} 
                  href={`/blog/${blog.slug || blog._id}`}
                  className="block group"
                >
                  <div className="flex space-x-3">
                    <div className="w-16 h-12 relative rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={blog.featuredImage}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {blog.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(blog.publishedAt)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {blog.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Newsletter Signup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stay Updated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Get weekly insights, achievements, and updates from Woxsen University School of Business.
          </p>
          
          <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              disabled={subscriptionStatus === 'loading'}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              required
            />
            
            <button 
              type="submit"
              disabled={subscriptionStatus === 'loading' || subscriptionStatus === 'success'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {subscriptionStatus === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : subscriptionStatus === 'success' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Subscribed!
                </>
              ) : (
                'Subscribe'
              )}
            </button>
          </form>

          {/* Status Messages */}
          {subscriptionMessage && (
            <div className={`mt-3 p-2 rounded-md text-xs flex items-center ${
              subscriptionStatus === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {subscriptionStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              )}
              {subscriptionMessage}
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            Weekly newsletter featuring staff achievements, new publications, upcoming events, and research highlights.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogSidebar;
