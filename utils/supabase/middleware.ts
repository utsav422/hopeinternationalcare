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

    // protected routes
    if (error) {
      url.searchParams.set('error', encodeURIComponent(error.message));
      //   return NextResponse.redirect(url);
    }
    if (
      !user &&
      (request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/admin'))
    ) {
      // no user, potentially respond by redirecting the user to the login page
      url.pathname = '/sign-in';
      return NextResponse.rewrite(url);
    }

    if (
      ['/admin/sign-in', '/admin/sign-up'].includes(request.nextUrl.pathname) &&
      user &&
      user.role === 'service_role'
    ) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (
      ['/sign-in', '/sign-up'].includes(request.nextUrl.pathname) &&
      user &&
      user.role === 'authenticated'
    ) {
      return NextResponse.redirect(new URL('/profile', request.url));
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
