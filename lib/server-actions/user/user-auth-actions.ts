'use server';

import {headers} from 'next/headers';
import {logger} from '@/utils/logger';
import {createServerSupabaseClient} from '@/utils/supabase/server';
import {createAdminSupabaseClient} from '@/utils/supabase/admin';
import {redirect, RedirectType} from "next/navigation";
import {getQueryClient} from "@/utils/get-query-client";
import {queryKeys} from "@/lib/query-keys";

export const signUpAction = async (formData: FormData) => {
    try {
        const supabase = await createServerSupabaseClient();
        const supabaseAdmin = createAdminSupabaseClient();
        const origin = (await headers()).get('origin');

        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();
        const full_name = formData.get('full_name')?.toString() ?? '';
        const phone = formData.get('phone')?.toString();

        if (!(email && password)) {
            return {success: false, message: 'Email and password are required'};
        }
        const {
            data: exisitingProfileWithEmail,
            error: ExisitingProfileWithEmailError
        } = await supabaseAdmin.from('profiles').select().eq('email', email).maybeSingle();
        if (exisitingProfileWithEmail) {
            logger.error('user with email is already exist', {
                error: ExisitingProfileWithEmailError
            });
            return {success: false, message: 'user with email is already exist, try again with another email'};
        }

        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            phone: phone as string,
            options: {
                data: {
                    full_name,
                    role: 'authenticated',
                },
                emailRedirectTo: `${origin}${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
            },
        });

        if (error) {
            logger.error('user signup failed', {
                ...error
            });
            return {success: false, message: error.message};
        }
        const user = data.user;
        if (user === null) {
            return {
                success: false,
                message:
                    'User signup failed. Please contact the administrator for more information.',
            };
        }

        const {error: profileError} = await supabaseAdmin.from('profiles').insert([
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
            logger.error('Profile creation failed: ProfileErorr:70:', {
                ...profileError
            });

            // Check for duplicate email error
            if (profileError.message.includes('duplicate key value violates unique constraint "profiles_email_unique"')) {
                return {success: false, message: 'user with email is already exist, try again with another email'};
            }

            return {success: false, message: profileError.message}
        }
        logger.info('Profile created successfully', {userId: user.id});
        await getQueryClient().invalidateQueries({queryKey: queryKeys.users.session});

        return {success: true, message: 'Profile created successfully', data: {user}};

    } catch (e) {
        const error = e as Error;
        logger.info('user signup failed, and catched', {...error});
        return {success: false, message: error.message};
    }
};

export const signInAction = async (formData: FormData) => {
    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const supabase = await createServerSupabaseClient();

        const {
            data: {user, weakPassword},
            error,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !user) {
            return {
                success: false,
                message: error?.message ?? 'Something went wrong, user not found!',
            };
        }
        await getQueryClient().invalidateQueries({queryKey: queryKeys.users.session});
        return {success: true, message: 'signing successfully', data: {user, weakPassword}};
    } catch (e) {
        const error = e as Error;
        console.error('Error signing in:', error);
        return {success: false, message: error.message};
    }
};

export const forgotPasswordAction = async (formData: FormData) => {
    try {
        const email = formData.get('email')?.toString();
        const supabase = await createServerSupabaseClient();
        const origin = (await headers()).get('origin');

        if (!email) {
            return {success: false, message: 'Email is required'};
        }

        const {error} = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback?redirect_to=/reset-password`,
        });

        if (error) {
            return {
                success: false,
                message: `Could not reset password due to:  ${error.message}`,
            };
        }
        await getQueryClient().invalidateQueries({queryKey: queryKeys.users.session});
        return {success: true, data: null, message: 'Password reset link sent successfully'};
    } catch (e) {
        const error = e as Error;
        return {success: false, message: error.message};
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
                message: 'Password and confirm password are required',
            };
        }

        if (password !== confirmPassword) {
            return {success: false, message: 'Passwords do not match'};
        }

        const {error} = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            return {
                success: false,
                message: `Password update failed: ${error.message}`,
            };
        }

        return {success: true, data: null, message: 'Password updated successfully'};
    } catch (e) {
        const error = e as Error;
        return {success: false, message: error.message};
    }
};

export const signOutAction = async () => {
    try {
        const supabase = await createServerSupabaseClient();
        const {error} = await supabase.auth.signOut();
        if (error) {
            return {success: false, message: error.message};
        }
        await getQueryClient().invalidateQueries({queryKey: queryKeys.users.session});
        redirect('/sign-in', RedirectType.replace)

        // return {success: true, data: null, message: 'user sign out successfully'};
    } catch (e) {
        const error = e as Error;
        return {success: false, message: error.message};
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
                message: ` ${password ? '' : 'Password is required'} ${refresh_token ? '' : 'Refresh token is empty or not provided'
                }`.trim(),
            };
        }
        await supabase.auth.refreshSession({
            refresh_token: refresh_token as string,
        });

        const {data: userData, error: userError} = await supabase.auth.updateUser(
            {
                password,
            }
        );
        if (userError) {
            return {success: false, message: userError.message};
        }
        if (!userData) {
            return {
                success: false,
                message: 'Something went wrong! contact to adminstrator',
            };
        }
        return {
            success: true,
            message: 'Password setup successfully',
            data: userData,
        };
    } catch (error: unknown) {
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Something went wrong! Please contact the administrator.',
        };
    }
};
