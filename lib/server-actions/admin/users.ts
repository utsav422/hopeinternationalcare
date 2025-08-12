'use server';

import { createAdminSupabaseClient } from '@/utils/supabase/admin';

export const createUser = async (formData: FormData) => {
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const adminAuthClient = supabaseAdmin.auth.admin;
    const email = formData.get('email')?.toString();
    const full_name = formData.get('full_name')?.toString() ?? 'superadmin';
    const phone = formData.get('phone')?.toString() ?? '+9779800000';
    const role = 'authenticated';

    const password = formData.get('password')?.toString();

    if (!(email && password)) {
      return { success: false, error: 'Email and password are required' };
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
      return { success: false, error: error.message };
    }
    const id = user?.id;
    if (id) {
      const { data, error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id,
          full_name,
          email,
          phone,
          role,
        })
        .select();
      if (profileError) {
        return { success: false, error: profileError.message };
      }
      return { success: true, data: data[0] };
    }
    return { success: false, error: 'User not created' };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
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
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
};

export const adminDeleteUser = async (id: string) => {
  try {
    const supabaseAdmin = createAdminSupabaseClient();
    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
};
