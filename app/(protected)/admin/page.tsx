'use server';
import Dashboard from '@/components/Admin/dashboard';
import { createClient } from '@/utils/supabase/server';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user: _ },
  } = await supabase.auth.getUser();

  return <Dashboard />;
}
