// import type { AuthError } from '@supabase/supabase-js';
// import { redirect } from 'next/navigation';
// import { createClient } from '@/utils/supabase/admin';
import SignInCard from './_components/signin-card';

export default async function Login(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const _searchParams = await props?.searchParams;
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-teal-50 to-indigo-100 p-4">
      <SignInCard />
    </div>
  );
}
