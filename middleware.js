// Next.js Middleware — Route Protection
import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check for access_token OR refresh_token (refresh will handle expired access tokens)
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;
    const hasSession = accessToken || refreshToken;

    // Public routes — always accessible
    const publicRoutes = ['/', '/login', '/about', '/contact', '/privacy-policy', '/refund-policy', '/terms-and-conditions'];
    const isPublicRoute = publicRoutes.includes(pathname);
    const isApiRoute = pathname.startsWith('/api/');
    const isStaticRoute = pathname.startsWith('/_next/') || pathname.startsWith('/favicon') || pathname.includes('.');

    // Allow public routes, API routes, and static files
    if (isPublicRoute || isApiRoute || isStaticRoute) {
        return NextResponse.next();
    }

    // Protected routes — require session (access OR refresh token)
    if (!hasSession) {
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
