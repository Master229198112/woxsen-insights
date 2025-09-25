import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Woxsen University - Insights',
  description: 'Academic achievements, research, and insights from Woxsen University School of Business',
  keywords: 'Woxsen University, School of Business, Research, Insights, Academic',
  
  // Open Graph tags for LinkedIn and other social media
  openGraph: {
    title: 'Woxsen University - Insights',
    description: 'Academic achievements, research, and insights from Woxsen University School of Business',
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL || 'https://sobinsights.aircwou.in',
    siteName: 'Woxsen University Insights',
    images: [
      {
        url: '/Woxsen-University.jpg', // Default image for homepage
        width: 1200,
        height: 630,
        alt: 'Woxsen University School of Business',
      }
    ],
  },
  
  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    site: '@WoxsenUniversity', // Replace with actual Twitter handle if available
    creator: '@WoxsenUniversity',
    title: 'Woxsen University - Insights',
    description: 'Academic achievements, research, and insights from Woxsen University School of Business',
    images: ['/Woxsen-University.jpg'],
  },
  
  // LinkedIn specific
  alternates: {
    canonical: process.env.NEXTAUTH_URL || 'https://sobinsights.aircwou.in',
  },
  
  // Additional meta tags
  authors: [{ name: 'Woxsen University School of Business' }],
  publisher: 'Woxsen University',
  robots: 'index, follow',
  
  // Verification tags (add these if you have them)
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body 
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
