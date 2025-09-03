import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const BlogSidebar = ({ relatedBlogs, currentCategory }) => {
  const categories = [
    { name: 'Research', href: '/category/research', color: 'bg-blue-100 text-blue-800' },
    { name: 'Achievements', href: '/category/achievements', color: 'bg-green-100 text-green-800' },
    { name: 'Publications', href: '/category/publications', color: 'bg-purple-100 text-purple-800' },
    { name: 'Events', href: '/category/events', color: 'bg-orange-100 text-orange-800' },
    { name: 'Patents', href: '/category/patents', color: 'bg-pink-100 text-pink-800' },
  ];

  return (
    <div className="space-y-8">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                href={category.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 ${
                  currentCategory === category.name.toLowerCase() 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700'
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Related Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatedBlogs.map((blog) => (
                <Link 
                  key={blog._id} 
                  href={`/blog/${blog._id}`}
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
            Get the latest insights from Woxsen University School of Business.
          </p>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogSidebar;
