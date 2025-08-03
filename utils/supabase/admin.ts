// import { createBrowserClient } from "@supabase/ssr";

// export const createClient = () =>
//     createBrowserClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!, {
//         auth: {
//             autoRefreshToken: false,
//             persistSession: false
//         }
//     }
//     );

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export const createClient = async () => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRole = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!supabaseServiceRole) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_SERVICE_ROLE environment variable'
    );
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
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
  });
};
