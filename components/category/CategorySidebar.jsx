import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Lightbulb, Calendar, Tag, User, Search, PenTool, Handshake } from 'lucide-react';

// Define the current categories exactly as they appear in the navbar
const CURRENT_CATEGORIES = [
  { 
    slug: 'research', 
    name: 'Research & Publications', 
    icon: BookOpen,
    description: 'Academic studies, research papers, and journal articles'
  },
  { 
    slug: 'achievements', 
    name: 'Achievements', 
    icon: Trophy,
    description: 'Awards and accomplishments'
  },
  { 
    slug: 'events', 
    name: 'Events', 
    icon: Calendar,
    description: 'Campus events and conferences'
  },
  { 
    slug: 'patents', 
    name: 'Patents', 
    icon: Lightbulb,
    description: 'Innovation and intellectual property'
  },
  { 
    slug: 'case-studies', 
    name: 'Case Studies', 
    icon: Search,
    description: 'Real-world business case studies'
  },
  { 
    slug: 'blogs', 
    name: 'Blogs', 
    icon: PenTool,
    description: 'Insights and thought leadership'
  },
  { 
    slug: 'industry-collaborations', 
    name: 'Industry Collaborations', 
    icon: Handshake,
    description: 'Partnerships and collaborations'
  }
];

// Icon mapping for categories
const categoryIcons = {
  research: BookOpen,
  achievements: Trophy,
  events: Calendar,
  patents: Lightbulb,
  'case-studies': Search,
  blogs: PenTool,
  'industry-collaborations': Handshake,
};

export default function CategorySidebar({ data, currentCategory }) {
  // Filter out the current category and ensure we only show valid categories
  const otherCategories = CURRENT_CATEGORIES.filter(cat => cat.slug !== currentCategory);

  return (
    <div className="space-y-6">
      {/* Popular Tags */}
      {data.filters.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Tag className="h-5 w-5 mr-2" />
              Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.filters.tags.slice(0, 15).map((tag) => (
                <Link
                  key={tag.name}
                  href={`?tag=${encodeURIComponent(tag.name)}`}
                  className="hover:scale-105 transition-transform"
                >
                  <Badge variant="secondary" className="text-sm">
                    {tag.name} ({tag.count})
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Authors */}
      {data.filters.authors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <User className="h-5 w-5 mr-2" />
              Top Authors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.filters.authors.slice(0, 8).map((author) => (
                <Link
                  key={author._id}
                  href={`?author=${encodeURIComponent(author.name)}`}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{author.name}</span>
                  <Badge variant="outline">{author.count}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Explore Other Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {otherCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <IconComponent className="h-5 w-5 text-gray-400 group-hover:text-blue-600 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Category Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Posts</span>
              <span className="font-semibold">{data.stats.totalPosts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Views</span>
              <span className="font-semibold">{data.stats.totalViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contributors</span>
              <span className="font-semibold">{data.stats.totalAuthors}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
