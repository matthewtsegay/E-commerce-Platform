import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAdminRole } from '@/lib/roles';

const protectedPaths = ['/checkout', '/orders', '/profile'];
const customerOnlyPaths = ['/cart', '/checkout', '/orders', '/profile'];
const adminPaths = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  const requiresAuth = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const requiresAdmin = adminPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isCustomerOnlyRoute = customerOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isCustomerOnlyRoute && accessToken && isAdminRole(role)) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (requiresAuth && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresAdmin) {
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdminRole(role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};
