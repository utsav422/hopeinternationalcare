'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { encodedRedirect } from '@/utils/utils';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const supabase = await createClient();
  const full_name = formData.get('full_name')?.toString() ?? '';
  const phone = formData.get('phone')?.toString();
  const origin = (await headers()).get('origin');

  if (!(email && password)) {
    return encodedRedirect(
      'error',
      '/sign-up',
      'Email and password are required'
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    phone: phone as string,
    options: {
      data: {
        full_name,
        role: 'authenticated',
      },
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return encodedRedirect('error', '/sign-up', error.message);
  }
  const user = data.user;
  if (user === null) {
    return encodedRedirect(
      'error',
      '/sign-up',
      'User Singup Failed plaease contact to adminstrator for more info.'
    );
  }

  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: user.id,
      email,
      full_name,
      phone,
      role: 'authenticated',
      created_at: new Date().toISOString(),
    },
  ]);

  if (profileError) {
    // TODO: Log profile creation error using a proper logging mechanism
  } else {
    // TODO: Log profile created successfully using a proper logging mechanism
  }

  return encodedRedirect(
    'success',
    '/sign-up',
    'Thanks for signing up! Please check your email for a verification link.'
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient();

  const {
    data: { user, weakPassword },
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

  if (user?.role === 'authenticated') {
    return redirect(`/profile?message=${weakPassword?.message ?? ''}`);
  }
  return redirect('/');
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get('origin');
  const callbackUrl = formData.get('callbackUrl')?.toString();

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?redirect_to=/reset-password`,
  });

  if (error) {
    return encodedRedirect(
      'error',
      '/forgot-password',
      `Could not reset password due to:  ${error.message}`
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    'success',
    '/forgot-password',
    'Check your email for a link to reset your password.'
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!(password && confirmPassword)) {
    encodedRedirect(
      'error',
      '/reset-password',
      'Password and confirm password are required'
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect('error', '/reset-password', 'Passwords do not match');
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    encodedRedirect(
      'error',
      '/reset-password',
      `Password update failed: ${error.message}`
    );
  }

  encodedRedirect('success', '/reset-password', 'Password updated');
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/sign-in');
};

export const setupPassword = async (formData: FormData) => {
  try {
    const refresh_token = formData.get('refresh_token')?.toString();
    const password = formData.get('password')?.toString();
    const supabase = await createClient();
    if (!(password && refresh_token)) {
      throw new Error(
        ` ${!password && 'Password is requried'} ${
          !refresh_token && 'refresh_token is empty or not provided'
        }`
      );
    }
    await supabase.auth.refreshSession({
      refresh_token: refresh_token as string,
    });

    const { data: userData, error: userError } = await supabase.auth.updateUser(
      {
        password,
      }
    );
    if (userError) {
      throw new Error(userError.message.toString());
    }
    if (!userData) {
      throw new Error('Something went wrong! contact to adminstrator');
    }
    return {
      success: true,
      userData,
      message: 'successfully setup password for you account.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Something went wrong! contact to adminstrator',
    };
  }
};
