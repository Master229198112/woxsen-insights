import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EnhancedAuthorProfile from '@/components/author/EnhancedAuthorProfile';

async function getAuthorData(authorId, searchParams) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    
    // Handle searchParams properly
    const awaitedSearchParams = await searchParams;
    const cleanParams = {};
    
    if (awaitedSearchParams) {
      Object.keys(awaitedSearchParams).forEach(key => {
        if (typeof key === 'string' && typeof awaitedSearchParams[key] === 'string') {
          cleanParams[key] = awaitedSearchParams[key];
        }
      });
    }
    
    const params = new URLSearchParams(cleanParams);
    
    const response = await fetch(`${baseUrl}/api/author/${authorId}?${params}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching author data:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { authorId } = await params;
  const data = await getAuthorData(authorId, {});
  
  if (!data?.author) {
    return {
      title: 'Author Not Found - Woxsen Insights'
    };
  }

  const { author } = data;
  
  return {
    title: `${author.name} - Author Profile | Woxsen Insights`,
    description: `View all posts and insights from ${author.name}, ${author.department} at Woxsen University School of Business.`,
    keywords: `${author.name}, ${author.department}, Woxsen University, author profile`,
    openGraph: {
      title: `${author.name} - Author Profile`,
      description: `View all posts and insights from ${author.name}, ${author.department}.`,
      type: 'profile',
    }
  };
}

export default async function AuthorProfilePage({ params, searchParams }) {
  const { authorId } = await params;
  const data = await getAuthorData(authorId, searchParams);
  
  if (!data) {
    notFound();
  }

  const { author, posts, stats, postsByCategory, pagination } = data;
  const awaitedSearchParams = await searchParams;
  const currentPage = parseInt(awaitedSearchParams?.page) || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main>
        <EnhancedAuthorProfile 
          author={author}
          posts={posts}
          stats={stats}
          postsByCategory={postsByCategory}
          pagination={pagination}
          currentPage={currentPage}
        />
      </main>
      
      <Footer />
    </div>
  );
}
