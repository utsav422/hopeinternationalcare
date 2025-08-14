import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from './database.types';

export const updateSession = async (request: NextRequest) => {
    // This `try/catch` block is only here for the interactive tutorial.
    // Feel free to remove once you have Supabase connected.
    try {
        // Create an unmodified response
        let supabaseResponse = NextResponse.next({
            request,
        });

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            throw new Error('Supabase environment variables are not set');
        }
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseAnonKey) {
            throw new Error('Supabase environment variables are not set');
        }
        const supabase = createServerClient<Database>(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        for (const { name, value } of cookiesToSet) {
                            request.cookies.set(name, value);
                        }
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                    },
                },
            }
        );

        // Do not run code between createServerClient and
        // supabase.auth.getUser(). A simple mistake could make it very hard to debug
        // issues with users being randomly logged out.
        // IMPORTANT: DO NOT REMOVE auth.getUser()

        const url = request.nextUrl.clone();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        // Check if current route is an auth route
        const isAuthRoute =
            request.nextUrl.pathname.startsWith('/sign-in') ||
            request.nextUrl.pathname.startsWith('/sign-up') ||
            request.nextUrl.pathname.startsWith('/forgot-password') ||
            request.nextUrl.pathname.startsWith('/admin-auth/sign-in') ||
            request.nextUrl.pathname.startsWith('/admin-auth/sign-up') ||
            request.nextUrl.pathname.startsWith('/setup-password');

        // Handle authentication errors
        if (error) {
            // For auth routes, pass the error as a URL parameter so toast can be displayed
            if (isAuthRoute) {
                url.searchParams.set('error', encodeURIComponent(error.message));
                // return NextResponse.redirect(url);
            }
            // For other routes, we might want to redirect to login with error
            // But for now, we'll let the existing protection logic handle it
        }

        // Redirect authenticated users away from auth pages
        if (user) {
            // Admin users should be redirected from admin auth pages
            if (
                user.role === 'service_role' &&
                (request.nextUrl.pathname.startsWith('/admin-auth/sign-in') ||
                    request.nextUrl.pathname.startsWith('/admin-auth/sign-up'))
            ) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }

            // Regular users should be redirected from user auth pages
            if (
                user.role === 'authenticated' &&
                (request.nextUrl.pathname.startsWith('/sign-in') ||
                    request.nextUrl.pathname.startsWith('/sign-up') ||
                    request.nextUrl.pathname.startsWith('/forgot-password'))
            ) {
                return NextResponse.redirect(new URL('/profile', request.url));
            }
        }

        // Protect admin routes - only service_role users can access
        if (request.nextUrl.pathname.startsWith('/admin')) {
            // Allow access to admin auth pages for non-authenticated users
            const isAdminAuthPage =
                request.nextUrl.pathname.startsWith('/admin-auth/sign-in') ||
                request.nextUrl.pathname.startsWith('/admin-auth/sign-up');

            if (!user) {
                // If not logged in and trying to access admin pages (except auth), redirect to admin login
                if (!isAdminAuthPage) {
                    return NextResponse.redirect(new URL('/admin-auth/sign-in', request.url));
                }
            } else if (user.role !== 'service_role') {
                // If logged in but not a service_role user, redirect to appropriate area
                if (user.role === 'authenticated') {
                    return NextResponse.redirect(new URL('/profile', request.url));
                } else {
                    return NextResponse.redirect(new URL('/sign-in', request.url));
                }
            } else if (isAdminAuthPage) {
                // If service_role user tries to access admin auth pages, redirect to admin dashboard
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }

        // Protect user routes - only authenticated users can access
        if (request.nextUrl.pathname.startsWith('/users')) {
            if (!user) {
                // If not logged in, redirect to sign in
                return NextResponse.redirect(new URL('/sign-in', request.url));
            } else if (user.role !== 'authenticated') {
                // If logged in but not an authenticated user (e.g., service_role), redirect to admin
                if (user.role === 'service_role') {
                    return NextResponse.redirect(new URL('/admin', request.url));
                } else {
                    return NextResponse.redirect(new URL('/sign-in', request.url));
                }
            }
        }

        // Protect profile route - only authenticated users can access
        if (request.nextUrl.pathname.startsWith('/profile')) {
            if (!user) {
                // If not logged in, redirect to sign in
                return NextResponse.redirect(new URL('/sign-in', request.url));
            } else if (user.role !== 'authenticated') {
                // If logged in but not an authenticated user, redirect to appropriate area
                if (user.role === 'service_role') {
                    return NextResponse.redirect(new URL('/admin', request.url));
                } else {
                    return NextResponse.redirect(new URL('/sign-in', request.url));
                }
            }
        }

        return supabaseResponse;
    } catch (_e) {
        // If you are here, a Supabase client could not be created!
        // This is likely because you have not set up environment variables.
        // Check out http://localhost:3000 for Next Steps.
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
};
