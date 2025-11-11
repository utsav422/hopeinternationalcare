import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from './database.types';

const Roles = {
    Service: 'service_role',
    Authenticated: 'authenticated',
} as const;

const isAuthRoute = (pathname: string) =>
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/admin-auth/sign-in') ||
    pathname.startsWith('/admin-auth/sign-up') ||
    pathname.startsWith('/setup-password');

const isAdminAuthRoute = (pathname: string) =>
    pathname.startsWith('/admin-auth/sign-in') ||
    pathname.startsWith('/admin-auth/sign-up');

const isAdminRoute = (pathname: string) => pathname.startsWith('/admin');

const isUserRoute = (pathname: string) => pathname.startsWith('/users'); // covers /users and /users/profile and subpaths

const getEnvOrThrow = (key: string): string => {
    const value = process.env[key];
    if (!value)
        throw new Error(`Missing required environment variable: ${key}`);
    return value;
};

const buildRedirect = (path: string, req: NextRequest) =>
    NextResponse.redirect(new URL(path, req.url));

export const updateSession = async (request: NextRequest) => {
    try {
        let response = NextResponse.next({ request });

        const supabaseUrl = getEnvOrThrow('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseAnonKey = getEnvOrThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY');

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
                        response = NextResponse.next({ request });
                    },
                },
            }
        );

        // IMPORTANT: Do not run additional code between client creation and getUser - HERE
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        // For auth routes, surface auth errors via query param for UI handling
        if (error && isAuthRoute(request.nextUrl.pathname)) {
            const url = request.nextUrl.clone();
            url.searchParams.set('error', encodeURIComponent(error.message));
            // Intentionally not redirecting to avoid changing current behavior.
            // To enable, uncomment the next line:
            // return NextResponse.redirect(url);
        }

        // Admin routes protection
        if (isAdminRoute(request.nextUrl.pathname)) {
            const onAdminAuthPage = isAdminAuthRoute(request.nextUrl.pathname);

            if (!user) {
                // Non-authenticated users can access admin auth pages only
                if (!onAdminAuthPage)
                    return buildRedirect('/admin-auth/sign-in', request);
            } else if (user.role !== Roles.Service) {
                // Authenticated but not service role
                if (user.role === Roles.Authenticated)
                    return buildRedirect('/users/profile', request);
                return buildRedirect('/sign-in', request);
            } else if (onAdminAuthPage) {
                // Service role users should not see admin auth pages
                return buildRedirect('/admin', request);
            }
        }

        // User routes protection (covers /users and /users/profile)
        if (isUserRoute(request.nextUrl.pathname)) {
            if (!user) return buildRedirect('/sign-in', request);

            if (user.role !== Roles.Authenticated) {
                if (user.role === Roles.Service)
                    return buildRedirect('/admin', request);
                return buildRedirect('/sign-in', request);
            }
        }

        return response;
    } catch (_e) {
        // Fall back if a Supabase client could not be created (e.g., missing env vars)
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
};
