import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
    // Step 1: Handle CORS
    const origin = request.headers.get('origin');
    const allowedOrigins = [
        'https://hopeinternationalcare.org',
        'https://www.hopeinternationalcare.org',
    ];

    if (origin && allowedOrigins.includes(origin)) {
        const response = NextResponse.next({
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods':
                    'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });

        // If this is a pre-flight OPTIONS request, return the response immediately
        if (request.method === 'OPTIONS') {
            return response;
        }
    }
    console.log('Middleware executed for URL:', request.nextUrl.pathname);
    // Step 2: Handle Supabase session updates
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
