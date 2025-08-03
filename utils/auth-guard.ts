// @/lib/auth-guard.ts
import { createClient } from '@/utils/supabase/server';

export async function requireAdmin() {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || user?.user_metadata.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  return user;
}
export async function requireUser() {
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || user?.user_metadata.role !== 'authenticated') {
    throw new Error('Unauthorized');
  }

  return user;
}
