'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  SortDesc, 
  Calendar,
  Eye,
  User,
  ChevronLeft,
  ChevronRight,
  Star
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CategoryContent({ data, info, searchParams }) {
  const router = useRouter();
  const params = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(params.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = parseInt(params.get('page')) || 1;
  const currentSort = params.get('sort') || 'newest';
  const currentAuthor = params.get('author') || '';
  const currentTag = params.get('tag') || '';

  const updateURL = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Reset to page 1 when changing filters
    if (updates.page === undefined && (updates.search !== undefined || updates.sort !== undefined || updates.author !== undefined || updates.tag !== undefined)) {
      newParams.delete('page');
    }

    router.push(`?${newParams.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateURL({ search: searchTerm });
  };

  const handleSortChange = (sortValue) => {
    updateURL({ sort: sortValue });
  };

  const handlePageChange = (page) => {
    updateURL({ page: page.toString() });
  };

  const clearFilters = () => {
    setSearchTerm('');
    router.push(window.location.pathname);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'title', label: 'Title A-Z' }
  ];

  return (
    <div className="space-y-8">
      {/* Featured Posts */}
      {data.featuredPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured {info.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.featuredPosts.map((post) => (
              <Card key={post._id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-40">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-white bg-yellow-600 rounded">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 space-x-3">
                    <span>{post.author.name}</span>
                    <span>•</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <Link href={`/blog/${post._id}`} className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full">
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={`Search ${info.title.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Sort and Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* Clear Filters */}
            {(params.get('search') || params.get('author') || params.get('tag') || params.get('sort') !== 'newest') && (
              <Button variant="ghost" onClick={clearFilters} size="sm">
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Author</label>
              <select
                value={currentAuthor}
                onChange={(e) => updateURL({ author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Authors</option>
                {data.filters.authors.map((author) => (
                  <option key={author._id} value={author.name}>
                    {author.name} ({author.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tag</label>
              <select
                value={currentTag}
                onChange={(e) => updateURL({ tag: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {data.filters.tags.map((tag) => (
                  <option key={tag.name} value={tag.name}>
                    {tag.name} ({tag.count})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, data.pagination.totalItems)} of {data.pagination.totalItems} results
        </span>
        {data.pagination.totalItems > 12 && (
          <span>
            Page {currentPage} of {data.pagination.total}
          </span>
        )}
      </div>

      {/* Blog Posts Grid */}
      <section>
        {data.blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.blogs.map((post) => (
              <Card key={post._id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <Link href={`/blog/${post._id}`}>
                  <div className="relative h-48">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>{post.views}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {data.pagination.total > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!data.pagination.hasPrev}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, data.pagination.total))].map((_, index) => {
              let pageNum;
              if (data.pagination.total <= 5) {
                pageNum = index + 1;
              } else if (currentPage <= 3) {
                pageNum = index + 1;
              } else if (currentPage >= data.pagination.total - 2) {
                pageNum = data.pagination.total - 4 + index;
              } else {
                pageNum = currentPage - 2 + index;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  onClick={() => handlePageChange(pageNum)}
                  size="sm"
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!data.pagination.hasNext}
            className="flex items-center"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
