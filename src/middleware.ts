import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORS configuration for API routes
const allowedOrigins = [
    'http://localhost:5173', // Dashboard dev server
    'http://localhost:3000', // Next.js dev server
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
];

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin') || '';
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');

    // Handle preflight OPTIONS request
    if (request.method === 'OPTIONS' && isApiRoute) {
        const response = new NextResponse(null, { status: 204 });

        if (allowedOrigins.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
        }
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Max-Age', '86400');

        return response;
    }

    // Handle actual request
    const response = NextResponse.next();

    if (isApiRoute && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
