import Link from 'next/link';
import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
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
            {/* <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/category/research" className="text-gray-300 hover:text-white transition-colors">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/category/achievements" className="text-gray-300 hover:text-white transition-colors">
                  Achievements
                </Link>
              </li>
              <li>
                <Link href="/category/publications" className="text-gray-300 hover:text-white transition-colors">
                  Publications
                </Link>
              </li>
              <li>
                <Link href="/category/events" className="text-gray-300 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/category/patents" className="text-gray-300 hover:text-white transition-colors">
                  Patents
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  Woxsen University<br />
                  Hyderabad, Telangana
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300 text-sm">airesearchcentre@woxsen.edu.in</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300 text-sm">+91 9154674599</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Woxsen University School of Business. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
