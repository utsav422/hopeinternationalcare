'use server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    (() => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!url) {
        throw new Error(
          'NEXT_PUBLIC_SUPABASE_URL environment variable is not set'
        );
      }
      return url;
    })(),
    (() => {
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!key) {
        throw new Error(
          'NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set'
        );
      }
      return key;
    })(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch (_error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
