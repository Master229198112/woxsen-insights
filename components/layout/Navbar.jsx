'use client';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import LoadingLink from '@/components/ui/LoadingLink';
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
  User,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get the user profile URL - simplified version
  const getUserProfileUrl = () => {
    return session?.user?.username ? `/author/${session.user.username}` : `/author/${session?.user?.id}`;
  };

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
          <LoadingLink href="/" className="flex items-center space-x-2 flex-shrink-0 group">
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
              <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Woxsen Insights</div>
              <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">School of Business</div>
            </div>
          </LoadingLink>

          {/* Desktop Navigation Links - More compact */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8 flex-1 justify-center">
            <LoadingLink 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Home
            </LoadingLink>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Categories
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="grid grid-cols-1 gap-1 max-h-96 overflow-y-auto">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <LoadingLink
                          key={category.href}
                          href={category.href}
                          className="group flex items-center px-4 py-3 hover:bg-blue-50 transition-colors duration-200"
                          onClick={handleCategoryClick}
                        >
                          <IconComponent className="h-5 w-5 text-gray-400 group-hover:text-blue-600 mr-3 transition-colors duration-200" />
                          <div>
                            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{category.name}</div>
                            <div className="text-sm text-gray-500 group-hover:text-blue-500 transition-colors duration-200">{category.description}</div>
                          </div>
                        </LoadingLink>
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
                <LoadingLink href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center space-x-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden lg:inline">Dashboard</span>
                </LoadingLink>
                
                <LoadingLink href="/dashboard/create" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center space-x-1">
                  <PenTool className="h-4 w-4" />
                  <span className="hidden lg:inline">Write</span>
                </LoadingLink>

                {session.user.role === 'admin' && (
                  <LoadingLink href="/admin" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center space-x-1">
                    <Settings className="h-4 w-4" />
                    <span className="hidden lg:inline">Admin</span>
                  </LoadingLink>
                )}

                <NotificationBell />

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <LoadingLink 
                    href={getUserProfileUrl()}
                    className="flex items-center space-x-2 hover:bg-blue-50 rounded-lg p-1 transition-colors duration-200 group"
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-full flex-shrink-0 transition-colors duration-200">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                        {session.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm min-w-0 flex-1 hidden lg:block">
                      <div className="font-medium text-gray-900 group-hover:text-blue-600 truncate max-w-32 transition-colors duration-200">
                        {session.user.name}
                      </div>
                      <div className="text-gray-500 group-hover:text-blue-500 truncate max-w-32 transition-colors duration-200">
                        {session.user.department}
                      </div>
                    </div>
                  </LoadingLink>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200 flex-shrink-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <LoadingLink 
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                >
                  Sign In
                </LoadingLink>
                <LoadingLink 
                  href="/auth/register"
                  className="text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Register
                </LoadingLink>
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
              className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
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
              <LoadingLink
                href="/"
                className="group flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                <GraduationCap className="h-5 w-5 group-hover:text-blue-600 transition-colors duration-200" />
                <span>Home</span>
              </LoadingLink>

              {/* Categories in Mobile */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Categories
                </div>
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <LoadingLink
                      key={category.href}
                      href={category.href}
                      className="group flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200 ml-4"
                      onClick={closeMobileMenu}
                    >
                      <IconComponent className="h-5 w-5 group-hover:text-blue-600 transition-colors duration-200" />
                      <span>{category.name}</span>
                    </LoadingLink>
                  );
                })}
              </div>
              
              {/* Mobile User Actions */}
              {session ? (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </div>
                  
                  {/* User Info - Clickable */}
                  <LoadingLink
                    href={getUserProfileUrl()}
                    className="group flex items-center space-x-3 px-3 py-2 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-full transition-colors duration-200">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
                        {session.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{session.user.name}</div>
                      <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-200">{session.user.department}</div>
                    </div>
                  </LoadingLink>

                  <LoadingLink
                    href="/dashboard"
                    className="group flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    <LayoutDashboard className="h-5 w-5 group-hover:text-blue-600 transition-colors duration-200" />
                    <span>Dashboard</span>
                  </LoadingLink>
                  
                  <LoadingLink
                    href="/dashboard/create"
                    className="group flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    <PenTool className="h-5 w-5 group-hover:text-blue-600 transition-colors duration-200" />
                    <span>Write Blog</span>
                  </LoadingLink>

                  {session.user.role === 'admin' && (
                    <LoadingLink
                      href="/admin"
                      className="group flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      <Settings className="h-5 w-5 group-hover:text-blue-600 transition-colors duration-200" />
                      <span>Admin</span>
                    </LoadingLink>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut();
                      closeMobileMenu();
                    }}
                    className="group flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 w-full text-left"
                  >
                    <LogOut className="h-5 w-5 group-hover:text-red-600 transition-colors duration-200" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                  <LoadingLink
                    href="/auth/signin"
                    className="group flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5 group-hover:text-blue-600 transition-colors duration-200" />
                    <span>Sign In</span>
                  </LoadingLink>
                  
                  <LoadingLink
                    href="/auth/register"
                    className="group flex items-center space-x-3 px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    <User className="h-5 w-5 group-hover:text-blue-700 transition-colors duration-200" />
                    <span>Register</span>
                  </LoadingLink>
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
