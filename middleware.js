// Next.js Middleware — Route Protection
import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('session_token')?.value;

    // Public routes — always accessible
    const publicRoutes = ['/', '/login', '/about', '/contact', '/privacy-policy', '/refund-policy', '/terms-and-conditions'];
    const isPublicRoute = publicRoutes.includes(pathname);
    const isApiRoute = pathname.startsWith('/api/');
    const isStaticRoute = pathname.startsWith('/_next/') || pathname.startsWith('/favicon') || pathname.includes('.');

    // Allow public routes, API routes, and static files
    if (isPublicRoute || isApiRoute || isStaticRoute) {
        return NextResponse.next();
    }

    // Protected routes — require session
    if (!sessionToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Admin routes — cookie exists, but full admin role check
    // is enforced server-side in API routes via requireAdmin()
    if (pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    return NextResponse.next();
}

// Define which paths this middleware applies to
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
