import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CategoryContent from '@/components/category/CategoryContent';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategorySidebar from '@/components/category/CategorySidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const categoryInfo = {
  research: {
    title: 'Research',
    description: 'Cutting-edge research findings and academic studies from Woxsen University School of Business',
    longDescription: 'Explore groundbreaking research conducted by our faculty and students. From market analysis to behavioral economics, our research shapes the future of business education.',
    icon: '🔬',
    color: 'blue'
  },
  achievements: {
    title: 'Achievements',
    description: 'Student and faculty accomplishments, awards, and recognitions',
    longDescription: 'Celebrating the outstanding achievements of our academic community. From international competitions to prestigious awards, discover how Woxsen scholars excel.',
    icon: '🏆',
    color: 'yellow'
  },
  publications: {
    title: 'Publications',
    description: 'Latest publications, journal articles, and academic papers',
    longDescription: 'Stay updated with the latest scholarly publications from our faculty. Access peer-reviewed articles and research papers published in top-tier journals.',
    icon: '📚',
    color: 'green'
  },
  events: {
    title: 'Events',
    description: 'Campus events, conferences, seminars, and academic gatherings',
    longDescription: 'Join our vibrant academic community through various events. From international conferences to guest lectures, stay connected with the latest happenings.',
    icon: '📅',
    color: 'purple'
  },
  patents: {
    title: 'Patents',
    description: 'Innovation and intellectual property achievements',
    longDescription: 'Discover the innovative solutions and intellectual property created by our researchers. Explore patents and inventions that contribute to technological advancement.',
    icon: '💡',
    color: 'pink'
  }
};

async function getCategoryData(slug, searchParams) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const params = new URLSearchParams(searchParams);
    
    const response = await fetch(`${baseUrl}/api/category/${slug}?${params}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching category data:', error);
    return null;
  }
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const info = categoryInfo[slug];
  
  if (!info) {
    return {
      title: 'Category Not Found - Woxsen Insights'
    };
  }
  
  return {
    title: `${info.title} - Woxsen Insights`,
    description: info.description,
    keywords: `${info.title}, Woxsen University, School of Business, ${slug}`,
    openGraph: {
      title: `${info.title} - Woxsen Insights`,
      description: info.description,
      type: 'website'
    }
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const info = categoryInfo[slug];
  
  if (!info) {
    notFound();
  }
  
  const data = await getCategoryData(slug, searchParams);
  
  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <CategoryHeader info={info} stats={data.stats} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div>Loading...</div>}>
              <CategoryContent 
                data={data} 
                info={info}
                searchParams={searchParams}
              />
            </Suspense>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CategorySidebar 
              data={data}
              currentCategory={slug}
            />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
