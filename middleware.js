import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// List of social media crawlers that should have unrestricted access
const SOCIAL_MEDIA_CRAWLERS = [
  'LinkedInBot',
  'facebookexternalhit',
  'TwitterBot',
  'WhatsApp',
  'TelegramBot',
  'SkypeUriPreview',
  'SlackBot',
  'DiscordBot',
  'redditbot',
  'Twitterbot',
  'LinkedInbot'
];

function isSocialMediaCrawler(userAgent) {
  if (!userAgent) return false;
  return SOCIAL_MEDIA_CRAWLERS.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
}

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token;
    const isAuthenticated = !!token;
    const isAdmin = token?.role === 'admin';
    const userAgent = req.headers.get('user-agent') || '';
    
    // Allow social media crawlers unrestricted access to public content
    if (isSocialMediaCrawler(userAgent)) {
      // Allow access to blog posts, author pages, categories, and static content
      if (
        pathname.startsWith('/blog/') ||
        pathname.startsWith('/author/') ||
        pathname.startsWith('/category/') ||
        pathname.startsWith('/public/') ||
        pathname === '/' ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.') // Allow access to files (images, etc.)
      ) {
        console.log(`🤖 Allowing social media crawler access: ${userAgent} → ${pathname}`);
        return NextResponse.next();
      }
    }
    
    // Skip middleware for static files and specific paths
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/') ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/public') ||
      pathname === '/maintenance' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml'
    ) {
      return NextResponse.next();
    }

    // Handle authenticated users trying to access auth pages
    if (isAuthenticated && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
      console.log(`🔄 Redirecting authenticated user from ${pathname} to /dashboard`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Simple maintenance mode check using environment variable or header
    // This avoids database calls in middleware
    try {
      // Check for maintenance mode via environment variable
      const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
      
      // OR check via a simple API call (but avoid recursive calls)
      if (!isMaintenanceMode && !pathname.startsWith('/maintenance')) {
        // Only make API call if we're not already on maintenance page
        try {
          const baseUrl = req.nextUrl.origin;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
          
          const maintenanceResponse = await fetch(`${baseUrl}/api/maintenance-status`, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (maintenanceResponse.ok) {
            const { maintenanceMode } = await maintenanceResponse.json();
            
            if (maintenanceMode) {
              // Allow admins to access admin routes during maintenance
              if (isAdmin && pathname.startsWith('/admin')) {
                return NextResponse.next();
              }
              
              // Allow auth routes during maintenance (so people can login)
              if (pathname.startsWith('/auth')) {
                return NextResponse.next();
              }
              
              // Redirect everyone else to maintenance page
              console.log(`🔧 Maintenance mode: Redirecting ${pathname} to /maintenance`);
              return NextResponse.redirect(new URL('/maintenance', req.url));
            }
          }
        } catch (fetchError) {
          console.log('Maintenance check skipped due to error:', fetchError.message);
          // Continue without maintenance check if API call fails
        }
      }
    } catch (error) {
      console.error('Middleware error:', error);
      // If maintenance check fails, allow access (fail-open)
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Allow all requests to pass through middleware
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|robots.txt|sitemap.xml).*)',
  ],
};