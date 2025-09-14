import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import CategoryContent from '@/components/category/CategoryContent';
import CategoryHeader from '@/components/category/CategoryHeader';
import CategorySidebar from '@/components/category/CategorySidebar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const categoryInfo = {
  research: {
    title: 'Research & Publications',
    description: 'Cutting-edge research findings, academic studies, journal articles, and scholarly publications from Woxsen University School of Business',
    longDescription: 'Explore groundbreaking research conducted by our faculty and students. From market analysis to behavioral economics, discover peer-reviewed articles, conference papers, and research publications that shape the future of business education.',
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
  },
  'case-studies': {
    title: 'Case Studies',
    description: 'Real-world business case studies and practical applications from industry leaders',
    longDescription: 'Dive deep into real-world business scenarios and learn from practical applications. Analyze successful strategies, challenges, and solutions from leading companies.',
    icon: '🔍',
    color: 'indigo'
  },
  blogs: {
    title: 'Blogs',
    description: 'General insights, opinions, and thought leadership pieces from our community',
    longDescription: 'Read diverse perspectives and thought-provoking insights from our faculty and students. Share ideas, opinions, and personal experiences in the business world.',
    icon: '✍️',
    color: 'emerald'
  },
  'industry-collaborations': {
    title: 'Industry Collaborations',
    description: 'Partnerships, collaborations, and strategic industry connections',
    longDescription: 'Explore our partnerships with industry leaders and collaborative projects. Learn about joint initiatives, corporate partnerships, and industry engagement programs.',
    icon: '🤝',
    color: 'cyan'
  }
};

async function getCategoryData(slug, searchParams) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
    console.log('Category: Fetching data for', slug, 'from', baseUrl);
    
    // FIX: Await searchParams first, then safely extract string key-value pairs
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
    
    const response = await fetch(`${baseUrl}/api/category/${slug}?${params}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch category data:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return null;
    }
    
    const data = await response.json();
    console.log('Category: Received data with', data.blogs?.length || 0, 'blogs');
    return data;
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
                searchParams={await searchParams}
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
