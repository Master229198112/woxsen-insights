import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  async function middleware(req) {
    // Check if maintenance mode is enabled
    try {
      // Only check maintenance mode for non-admin users
      const { pathname } = req.nextUrl;
      
      // Skip maintenance check for admin routes and API
      if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/auth')) {
        return NextResponse.next();
      }

      // Check maintenance mode (in production, you'd cache this)
      const baseUrl = req.nextUrl.origin;
      const settingsResponse = await fetch(`${baseUrl}/api/admin/settings`, {
        headers: {
          'Cookie': req.headers.get('cookie') || ''
        }
      });

      if (settingsResponse.ok) {
        const { settings } = await settingsResponse.json();
        
        if (settings.maintenanceMode) {
          // Redirect to maintenance page
          return NextResponse.redirect(new URL('/maintenance', req.url));
        }
      }
    } catch (error) {
      console.error('Middleware error:', error);
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
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
