import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /patients, /about)
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/api/auth/login', '/api/auth/session'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.includes(path);

  // Get tokens from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // If it's an API route, let it handle authentication internally
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // If user is not authenticated and trying to access a protected route
  if (!accessToken && !isPublicPath && path !== '/') {
    // For now, we'll let the client-side handle redirects
    // since we're using client-side authentication context
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};