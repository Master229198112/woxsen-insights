'use client';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ADD MOBILE MENU STATE

  const categories = [
    { 
      name: 'Research', 
      href: '/category/research', 
      icon: BookOpen,
      description: 'Academic studies and research findings'
    },
    { 
      name: 'Achievements', 
      href: '/category/achievements', 
      icon: Trophy,
      description: 'Awards and accomplishments'
    },
    { 
      name: 'Publications', 
      href: '/category/publications', 
      icon: Lightbulb,
      description: 'Journal articles and papers'
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

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  // CLOSE MOBILE MENU WHEN LINK IS CLICKED
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Woxsen Insights</div>
              <div className="text-xs text-gray-500">School of Business</div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onBlur={() => setTimeout(() => setCategoriesOpen(false), 200)}
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
                          onClick={() => setCategoriesOpen(false)}
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

            {/* Desktop User Actions */}
            {status === 'loading' ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                
                <Link href="/dashboard/create">
                  <Button size="sm" className="flex items-center">
                    <PenTool className="h-4 w-4 mr-2" />
                    Write
                  </Button>
                </Link>

                {session.user.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-medium text-blue-600">
                      {session.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{session.user.name}</div>
                    <div className="text-gray-500">{session.user.department}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="flex items-center text-gray-500 hover:text-red-600"
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

          {/* Mobile menu button */}
          <div className="md:hidden">
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
  );
}
