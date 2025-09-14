'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GraduationCap, Mail, MapPin, Phone, ArrowUp } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const exploreCategories = [
    // Column 1
    [
      { name: 'Research & Publications', href: '/category/research' },
      { name: 'Achievements', href: '/category/achievements' },
      { name: 'Events', href: '/category/events' },
      { name: 'Patents', href: '/category/patents' },
    ],
    // Column 2
    [
      { name: 'Case Studies', href: '/category/case-studies' },
      { name: 'Blogs', href: '/category/blogs' },
      { name: 'Industry Collaborations', href: '/category/industry-collaborations' },
    ]
  ];

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show button when user scrolls more than one viewport height
      setShowBackToTop(scrollY > windowHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-bold">Woxsen Insights</div>
                <div className="text-sm text-gray-400">School of Business</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Sharing insights, research, and achievements from Woxsen University School of Business. 
              Discover the latest in academic excellence, innovation, and thought leadership.
            </p>
          </div>

          {/* Explore Categories - 2 Columns */}
          <div className="md:col-span-4">
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Column 1 */}
              <div>
                <ul className="space-y-3">
                  {exploreCategories[0].map((category) => (
                    <li key={category.name}>
                      <Link 
                        href={category.href} 
                        className="text-gray-300 hover:text-white transition-colors text-sm"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Column 2 */}
              <div>
                <ul className="space-y-3">
                  {exploreCategories[1].map((category) => (
                    <li key={category.name}>
                      <Link 
                        href={category.href} 
                        className="text-gray-300 hover:text-white transition-colors text-sm"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <div>Woxsen University</div>
                  <div>Hyderabad, Telangana</div>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <a 
                  href="mailto:sob.insights@woxsen.edu.in"
                  className="text-gray-300 text-sm hover:text-white transition-colors"
                >
                  sob.insights@woxsen.edu.in
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <a 
                  href="tel:+919154674599"
                  className="text-gray-300 text-sm hover:text-white transition-colors"
                >
                  +91 9154674599
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Woxsen University School of Business. All rights reserved.
            </p>
            
            {/* Quick Links & Back to Top */}
            <div className="flex flex-wrap justify-center md:justify-end items-center space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                Dashboard
              </Link>
              <Link href="/auth/signin" className="text-gray-400 hover:text-white transition-colors text-sm">
                Sign In
              </Link>
              <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors text-sm">
                Join Community
              </Link>
              
              {/* Back to Top Button */}
              <button
                onClick={scrollToTop}
                className={`ml-4 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 ${
                  showBackToTop 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-50 transform translate-y-1'
                }`}
                aria-label="Back to top"
                title="Back to top"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Back to Top Button (Alternative position - bottom right) */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50 md:hidden"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
}
