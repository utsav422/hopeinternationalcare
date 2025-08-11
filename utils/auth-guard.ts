// @/lib/auth-guard.ts
import { createServerSupabaseClient } from '@/utils/supabase/server';

export async function requireAdmin() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || user?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  return { error, user };
}
export async function requireUser() {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || user?.role !== 'authenticated') {
    throw new Error('Unauthorized');
  }

  return user;
}
