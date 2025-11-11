import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const createAdminSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Note: not NEXT_PUBLIC_
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
        throw new Error(
            'Missing NEXT_PUBLIC_SUPABASE_URL environment variable'
        );
    }
    if (!supabaseServiceRoleKey) {
        // Note: not NEXT_PUBLIC_
        throw new Error(
            'Missing SUPABASE_SERVICE_ROLE_KEY environment variable'
        );
    }

    // Use supabase-js client for service role
    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
};
