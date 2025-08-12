'use server';

import { RedirectType, redirect } from 'next/navigation';
import { createAdminSupabaseClient } from '@/utils/supabase/admin';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';
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

export const signInAction = async (formData: FormData) => {
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

  if (error || !user) {
    return {
      error: error?.message ?? 'Something went wrong, user not found!',
    };
  }

  if (user?.role === 'service_role') {
    return redirect('/admin');
  }

  return redirect('/');
};
export const signOutAction = async () => {
  const supabase = createAdminSupabaseClient();
  await supabase.auth.signOut();
  return redirect('/sign-in', RedirectType.replace);
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
