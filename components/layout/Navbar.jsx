'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/notifications/NotificationBell';
import LoadingBar from '@/components/ui/LoadingBar';
import { 
  GraduationCap, 
  PenTool, 
  LogOut, 
  Settings,
  ChevronDown,
  BookOpen,
  Trophy,
  Lightbulb,
  Calendar,
  Search,
  Handshake,
  Menu,
  X,
  User
} from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = [
    { 
      name: 'Research & Publications', 
      href: '/category/research', 
      icon: BookOpen,
      description: 'Academic studies, research papers, and journal articles'
    },
    { 
      name: 'Achievements', 
      href: '/category/achievements', 
      icon: Trophy,
      description: 'Awards and accomplishments'
    },
    { 
      name: 'Events', 
      href: '/category/events', 
      icon: Calendar,
      description: 'Campus events and conferences'
    },
    { 
      name: 'Patents', 
      href: '/category/patents', 
      icon: Lightbulb,
      description: 'Innovation and intellectual property'
    },
    { 
      name: 'Case Studies', 
      href: '/category/case-studies', 
      icon: Search,
      description: 'Real-world business case studies'
    },
    { 
      name: 'Blogs', 
      href: '/category/blogs', 
      icon: PenTool,
      description: 'Insights and thought leadership'
    },
    { 
      name: 'Industry Collaborations', 
      href: '/category/industry-collaborations', 
      icon: Handshake,
      description: 'Partnerships and collaborations'
    }
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setCategoriesOpen(false);
      }
    }

    if (categoriesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [categoriesOpen]);

  // Close dropdown when route changes
  useEffect(() => {
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
  }, [router]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleCategoryClick = () => {
    setCategoriesOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - More responsive */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="relative w-16 h-10 flex-shrink-0">
              <Image
                src="/Woxsen-University.jpg"
                alt="Woxsen University Logo"
                fill
                className="object-contain rounded-lg"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold text-gray-900">Woxsen Insights</div>
              <div className="text-xs text-gray-500">School of Business</div>
            </div>
          </Link>

          {/* Desktop Navigation Links - More compact */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8 flex-1 justify-center">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Categories
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <Link
                          key={category.href}
                          href={category.href}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={handleCategoryClick}
                        >
                          <IconComponent className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{category.name}</div>
                            <div className="text-sm text-gray-500">{category.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop User Actions - Compact */}
            {status === 'loading' ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : session ? (
              <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden lg:flex">
                    Dashboard
                  </Button>
                </Link>
                
                <Link href="/dashboard/create">
                  <Button size="sm" className="flex items-center">
                    <PenTool className="h-4 w-4 lg:mr-2" />
                    <span className="hidden lg:inline">Write</span>
                  </Button>
                </Link>

                {session.user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Settings className="h-4 w-4 lg:mr-2" />
                      <span className="hidden lg:inline">Admin</span>
                    </Button>
                  </Link>
                )}

                <NotificationBell />

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">
                      {session.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm min-w-0 flex-1 hidden lg:block">
                    <div className="font-medium text-gray-900 truncate max-w-32">
                      {session.user.name}
                    </div>
                    <div className="text-gray-500 truncate max-w-32">
                      {session.user.department}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center text-gray-500 hover:text-red-600 flex-shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button and notifications */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notification Bell */}
            {session && <NotificationBell />}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Home Link */}
              <Link
                href="/"
                className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                <GraduationCap className="h-5 w-5" />
                <span>Home</span>
              </Link>

              {/* Categories in Mobile */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Categories
                </div>
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Link
                      key={category.href}
                      href={category.href}
                      className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors ml-4"
                      onClick={closeMobileMenu}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{category.name}</span>
                    </Link>
                  );
                })}
              </div>
              
              {/* Mobile User Actions */}
              {session ? (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-medium text-blue-600">
                        {session.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{session.user.name}</div>
                      <div className="text-xs text-gray-500">{session.user.department}</div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/create"
                    className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <PenTool className="h-5 w-5" />
                    <span>Write Blog</span>
                  </Link>

                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={closeMobileMenu}
                    >
                      <Settings className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut();
                      closeMobileMenu();
                    }}
                    className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  <Link
                    href="/auth/signin"
                    className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Sign In</span>
                  </Link>
                  
                  <Link
                    href="/auth/register"
                    className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </nav>
      
      {/* Loading Bar */}
      <LoadingBar />
    </>
  );
}
