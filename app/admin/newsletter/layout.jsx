'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { 
  Mail, 
  Users, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Menu,
  X,
  Home,
  User
} from 'lucide-react';

export default function NewsletterLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const navigation = [
    {
      name: 'Newsletter Dashboard',
      href: '/admin/newsletter',
      icon: Mail,
      current: pathname === '/admin/newsletter'
    },
    {
      name: 'Subscriber Management',
      href: '/admin/newsletter/subscribers',
      icon: Users,
      current: pathname === '/admin/newsletter/subscribers'
    },
    {
      name: 'Analytics',
      href: '/admin/newsletter/analytics',
      icon: BarChart3,
      current: pathname === '/admin/newsletter/analytics'
    },
    {
      name: 'Settings',
      href: '/admin/newsletter/settings',
      icon: Settings,
      current: pathname === '/admin/newsletter/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Navbar */}
      <Navbar />
      
      <div className="flex">
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h2 className="text-lg font-semibold text-gray-900">Newsletter Management</h2>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${item.current
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <IconComponent className={`mr-4 h-6 w-6 ${
                        item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Link
                href="/admin"
                className="flex-shrink-0 group block"
              >
                <div className="flex items-center">
                  <ArrowLeft className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    Back to Admin
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16">
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h2 className="text-lg font-semibold text-gray-900">Newsletter Management</h2>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        item.current
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className={`mr-3 h-5 w-5 ${
                        item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Link
                href="/admin"
                className="flex-shrink-0 group block w-full"
              >
                <div className="flex items-center">
                  <ArrowLeft className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                    Back to Admin Dashboard
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          {/* Top nav for mobile */}
          <div className="lg:hidden relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200" style={{ marginTop: '64px' }}>
            <button
              type="button"
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-900">Newsletter Management</h1>
              <Link
                href="/admin"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Admin
              </Link>
            </div>
          </div>

          {/* Page content with proper spacing */}
          <main className="flex-1" style={{ marginTop: '64px' }}>
            {children}
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-6 mb-4 md:mb-0">
                  <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                  <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900">
                    <User className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                  <Link href="/newsletter" className="flex items-center text-gray-600 hover:text-gray-900">
                    <Mail className="h-4 w-4 mr-2" />
                    Newsletter Landing
                  </Link>
                </div>
                <div className="text-sm text-gray-500">
                  © 2024 Woxsen University. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
