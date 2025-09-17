import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogComments from '@/components/blog/BlogComments';
import BlogSidebar from '@/components/blog/BlogSidebar';
import ShareButtons from '@/components/blog/ShareButtons';
import SmartImageWithAI from '@/components/ui/SmartImageWithAI';
import AuthorLink from '@/components/ui/AuthorLink';
import CategoryBasedDisplay from '@/components/blog/displays/CategoryBasedDisplay';
import { 
  Calendar, 
  User, 
  Eye, 
  Tag, 
  ArrowLeft,
  Clock
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

async function getBlog(idOrSlug) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    // The API now handles both IDs and slugs
    const response = await fetch(`${baseUrl}/api/blogs/${idOrSlug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  // Parameter is 'id' but can be either ID or slug
  const { id } = await params;
  const data = await getBlog(id);
  
  if (!data?.blog) {
    return {
      title: 'Blog Not Found - Woxsen Insights'
    };
  }

  const { blog } = data;
  
  return {
    title: `${blog.title} - Woxsen Insights`,
    description: blog.excerpt || blog.title,
    keywords: blog.tags?.join(', '),
    authors: [{ name: blog.author.name }],
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.title,
      images: [blog.featuredImage],
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [blog.author.name],
      url: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/blog/${blog.slug || blog._id}`
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.excerpt || blog.title,
      images: [blog.featuredImage],
    },
    alternates: {
      canonical: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/blog/${blog.slug || blog._id}`
    }
  };
}

export default async function BlogDetailPage({ params }) {
  // Parameter is 'id' but can be either ID or slug
  const { id } = await params;
  const data = await getBlog(id);
  
  if (!data?.blog) {
    notFound();
  }

  const { blog, comments, relatedBlogs } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href={`/category/${blog.category}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            {/* Header */}
            <header className="mb-8">
              {/* Category Badge */}
              <div className="mb-4">
                <Link 
                  href={`/category/${blog.category}`}
                  className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </Link>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {blog.title}
              </h1>

              {/* Excerpt - Only show for categories that have excerpts */}
              {blog.excerpt && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  {blog.excerpt}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <AuthorLink author={blog.author} showDepartment={true} className="text-gray-700" />
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(blog.publishedAt)}</span>
                </div>
                
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  <span>{blog.views} views</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {blog.content && blog.content.trim() 
                      ? `${Math.ceil(blog.content.split(' ').length / 200)} min read`
                      : 'Quick view'
                    }
                  </span>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-8">
                <SmartImageWithAI
                  src={blog.featuredImage}
                  alt={blog.title}
                  imageAnalysis={blog.imageAnalysis}
                  priority
                  naturalSize={true}
                  className="w-full"
                  aiLabelPosition="bottom-left"
                  showAILabel={true}
                />
              </div>

              {/* Share Buttons */}
              <div className="mb-8">
                <ShareButtons 
                  url={`${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/blog/${blog.slug || blog._id}`}
                  title={blog.title}
                  description={blog.excerpt || blog.title}
                />
              </div>
            </header>

            {/* Category-Based Content Display */}
            <CategoryBasedDisplay blog={blog} />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full flex-shrink-0">
                  <span className="text-xl font-bold text-blue-600">
                    {blog.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    <AuthorLink author={blog.author} className="text-gray-900 hover:text-blue-600" />
                  </h3>
                  <p className="text-gray-600 mb-2">{blog.author.department}</p>
                  <p className="text-sm text-gray-500">
                    Contributor at Woxsen University School of Business
                  </p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <BlogComments 
              blogId={blog._id} 
              comments={comments}
            />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <BlogSidebar 
              relatedBlogs={relatedBlogs}
              currentCategory={blog.category}
            />
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
