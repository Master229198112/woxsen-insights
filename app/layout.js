import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Woxsen University - Insights',
  description: 'Academic achievements, research, and insights from Woxsen University School of Business',
  keywords: 'Woxsen University, School of Business, Research, Insights, Academic',
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
