'use server';

import { RedirectType, redirect } from 'next/navigation';
import { createAdminSupabaseClient } from '@/utils/supabase/admin';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';
import { success } from 'zod';
export const signUpAction = async (formData: FormData) => {
    const supabaseAdmin = createAdminSupabaseClient();
    const adminAuthClient = supabaseAdmin.auth.admin;
    const email = formData.get('email')?.toString();
    const full_name = formData.get('full_name')?.toString() ?? 'superadmin';
    const phone = formData.get('phone')?.toString() ?? '+9779800000';
    const role = 'service_role';

    const password = formData.get('password')?.toString();

    if (!(email && password)) {
        return encodedRedirect(
            'error',
            '/sign-up',
            'Email and password are required'
        );
    }

    const {
        data: { user },
        error,
    } = await adminAuthClient.createUser({
        email,
        password,
        user_metadata: { role, full_name, phone },
        role,
        email_confirm: true,
    });

    if (error) {
        return encodedRedirect('error', '/admin/sign-up', error.message);
    }
    const id = user?.id;
    if (id) {
        await supabaseAdmin.from('profiles').upsert({
            id,
            full_name,
            email,
            phone,
            role,
        });
    }
    return encodedRedirect(
        'success',
        '/sign-up',
        'Thanks for signing up as Admin!.'
    );
};

export const AdminSignInAction = async (formData: FormData) => {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const supabase = await createServerSupabaseClient();

        const {
            data: { user },
            error,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error && !user) {
            return {
                success: false,
                error: error?.message ?? 'Something went wrong, user not found!',
            };
        }
        return { error: undefined, success: true, data: user, message: 'signin successfully' };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Something went wrong, user not found!' };
    }

};
export const signOutAction = async () => {
    try {

        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, error: undefined, message: 'user signout successfully' };

    } catch (e) {
        const error = e as Error;
        return { success: false, error: error.message };
    }

};

export const inviteUserAction = async (formData: FormData) => {
    const supabaseAdmin = createAdminSupabaseClient();
    const adminAuthClient = supabaseAdmin.auth.admin;
    const email = formData.get('email')?.toString();
    const full_name = formData.get('full_name');
    const phone = formData.get('phone');

    if (!email) {
        return encodedRedirect(
            'error',
            '/admin/users',
            'Email is required to invite a user.'
        );
    }
    let options: object | undefined;

    if (phone || full_name) {
        options = {
            full_name,
            phone,
        };
    }
    const { data, error } = await adminAuthClient.inviteUserByEmail(email, {
        redirectTo:
            `http://localhost:3000/setup-password${(full_name || phone ? '?' : '').trim()}${(full_name ? 'full_name='.concat(full_name as string) : '').trim()}${(phone ? '&phone='.concat(phone as string) : '').trim()}`.trim(),
        data: options,
    });

    if (error) {
        return encodedRedirect('error', '/admin/users', error.message);
    }
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
        {
            id: data.user.id,
            email: email as string,
            full_name: full_name as string,
            phone: phone as string,
            role: 'authenticated',
            created_at: new Date().toISOString(),
        },
    ]);
    if (profileError) {
        return encodedRedirect('error', '/admin/users', profileError?.message);
    }
    return {
        success: true,
        data,
        message: 'Successfully invited user and created the profile',
    };
};

export const getAuthSession = async () => {
    const supabaseAdmin = await createServerSupabaseClient();
    return await supabaseAdmin.auth.getUser();
};

// export const getCachedAuthSession = cache(getAuthSession);
