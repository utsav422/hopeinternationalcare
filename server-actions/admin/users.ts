'use server';

import { createAdminSupabaseClient } from '@/utils/supabase/admin';
import { encodedRedirect } from '@/utils/utils';
export const createUser = async (formData: FormData) => {
  const supabaseAdmin =  createAdminSupabaseClient();
  const adminAuthClient = supabaseAdmin.auth.admin;
  const email = formData.get('email')?.toString();
  const full_name = formData.get('full_name')?.toString() ?? 'superadmin';
  const phone = formData.get('phone')?.toString() ?? '+9779800000';
  const role = 'authenticated';

  const password = formData.get('password')?.toString();
  // const origin = (await headers()).get("origin");

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

export const getUserList = async (page?: number, pageSize?: number) => {
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const adminAuthClient = supabaseAdmin.auth.admin;
    const { data, error } = await adminAuthClient.listUsers({
      page,
      perPage: pageSize,
    });

    if (error) {
      throw new Error(error?.message);
    }
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error?.message : 'Something went wrong'
    );
  }
};

export const adminDeleteUser = async (id: string) => {
  const supabaseAdmin = createAdminSupabaseClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    throw new Error(error.message);
  }
};
