'use server';

import { headers } from 'next/headers';
import { logger } from '@/utils/logger';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { createAdminSupabaseClient } from '@/utils/supabase/admin';

export const signUpAction = async (formData: FormData) => {
    try {
        const supabase = await createServerSupabaseClient();
        const origin = (await headers()).get('origin');

        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();
        const full_name = formData.get('full_name')?.toString() ?? '';
        const phone = formData.get('phone')?.toString();

        if (!(email && password)) {
            return { success: false, error: 'Email and password are required' };
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
            return { success: false, error: error.message };
        }
        const user = data.user;
        if (user === null) {
            return {
                success: false,
                error:
                    'User signup failed. Please contact the administrator for more information.',
            };
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
            logger.error('Profile creation failed', {
                error: profileError.message,
                userId: user.id,
            });
            
            // Check for duplicate email error
            if (profileError.message.includes('duplicate key value violates unique constraint "profiles_email_unique"')) {
                return { success: false, error: 'user with email is already exist, try again with another email' };
            }
            
            return { success: false, error: profileError.message }
        }
        logger.info('Profile created successfully', { userId: user.id });
        return { success: true, message: 'Profile created successfully', userId: user.id };

    } catch (e) {
        const error = e as Error;
        return { success: false, error: error.message };
    }
};

export const signInAction = async (formData: FormData) => {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const supabase = await createServerSupabaseClient();

        const {
            data: { user, weakPassword },
            error,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !user) {
            return {
                success: false,
                error: error?.message ?? 'Something went wrong, user not found!',
            };
        }

        return { success: true, data: { user, weakPassword } };
    } catch (e) {
        const error = e as Error;
        return { success: false, error: error.message };
    }
};

export const forgotPasswordAction = async (formData: FormData) => {
    try {
        const email = formData.get('email')?.toString();
        const supabase = await createServerSupabaseClient();
        const origin = (await headers()).get('origin');

        if (!email) {
            return { success: false, error: 'Email is required' };
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/api/auth/callback?redirect_to=/reset-password`,
        });

        if (error) {
            return {
                success: false,
                error: `Could not reset password due to:  ${error.message}`,
            };
        }

        return { success: true, data: null };
    } catch (e) {
        const error = e as Error;
        return { success: false, error: error.message };
    }
};

export const resetPasswordAction = async (formData: FormData) => {
    try {
        const supabase = await createServerSupabaseClient();

        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!(password && confirmPassword)) {
            return {
                success: false,
                error: 'Password and confirm password are required',
            };
        }

        if (password !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }

        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            return {
                success: false,
                error: `Password update failed: ${error.message}`,
            };
        }

        return { success: true, data: null };
    } catch (e) {
        const error = e as Error;
        return { success: false, error: error.message };
    }
};

export const signOutAction = async () => {
    try {
        const supabase = await createServerSupabaseClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, data: null };
    } catch (e) {
        const error = e as Error;
        return { success: false, error: error.message };
    }
};

export const setupPasswordAction = async (formData: FormData) => {
    try {
        const refresh_token = formData.get('refresh_token')?.toString();
        const password = formData.get('password')?.toString();
        const supabase = await createServerSupabaseClient();
        if (!(password && refresh_token)) {
            return {
                success: false,
                error: ` ${password ? '' : 'Password is required'} ${refresh_token ? '' : 'Refresh token is empty or not provided'
                    }`.trim(),
            };
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
            return { success: false, error: userError.message };
        }
        if (!userData) {
            return {
                success: false,
                error: 'Something went wrong! contact to adminstrator',
            };
        }
        return {
            success: true,
            data: userData,
        };
    } catch (error: unknown) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Something went wrong! Please contact the administrator.',
        };
    }
};
