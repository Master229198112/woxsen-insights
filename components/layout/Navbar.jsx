'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  PenTool, 
  Settings,
  GraduationCap,
  BookOpen,
  Trophy,
  Calendar,
  Lightbulb
} from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const navigation = [
    { 
      name: 'Home', 
      href: '/',
      icon: GraduationCap 
    },
    { 
      name: 'Research', 
      href: '/category/research',
      icon: BookOpen 
    },
    { 
      name: 'Achievements', 
      href: '/category/achievements',
      icon: Trophy 
    },
    { 
      name: 'Publications', 
      href: '/category/publications',
      icon: Lightbulb 
    },
    { 
      name: 'Events', 
      href: '/category/events',
      icon: Calendar 
    },
    { 
      name: 'Patents', 
      href: '/category/patents',
      icon: Lightbulb 
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Woxsen Insights</div>
                <div className="text-xs text-gray-500 -mt-1">School of Business</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {status === 'loading' ? (
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                {/* Create Blog Button */}
                <Link href="/dashboard/create">
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <PenTool className="h-4 w-4 mr-2" />
                    Write
                  </Button>
                </Link>

                {/* Dashboard Link */}
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    Dashboard
                  </Button>
                </Link>

                {/* Admin Link (if admin) */}
                {session.user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                {/* User Profile */}
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-gray-900">{session.user.name}</div>
                    <div className="text-xs text-gray-500">{session.user.department}</div>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-sm font-medium">
                    {session.user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Sign Out */}
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/register">
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Actions */}
              {session && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link
                      href="/dashboard/create"
                      className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <PenTool className="h-5 w-5" />
                      <span>Write Blog</span>
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
