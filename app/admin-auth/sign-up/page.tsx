import { redirect } from 'next/navigation';
import { createAdminSupabaseClient } from '@/utils/supabase/admin';
import SignUpCard from './_components/singup-card';
import AdminSignUpClient from './_components/admin-signup-client';
import { Suspense } from 'react';

export default async function Signup() {
    const supabase = createAdminSupabaseClient();
    const adminAuthClient = supabase.auth.admin;

    const {
        data: { users },
        error: _,
    } = await adminAuthClient.listUsers();
    const isAdminAvailable =
        users?.filter((user) => user.role === 'service_role').length > 0;
    if (isAdminAvailable) {
        console.log({ isAdminAvailable })
        redirect('/admin/sign-in');
    }
    return <Suspense>
        <AdminSignUpClient />
    </Suspense>
}
