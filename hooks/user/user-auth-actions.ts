'use client';
import {useMutation, useQuery} from '@tanstack/react-query';
import {
    forgotPasswordAction,
    resetPasswordAction,
    setupPasswordAction,
    signInAction,
    signOutAction,
    signUpAction,
} from '@/lib/server-actions/user/user-auth-actions';
import { 
    getCurrentUserAction, 
    requireUserAction 
} from '@/lib/server-actions/user/auth-checks';

export const useUserSignUp = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await signUpAction(formData);
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        },
    });
};

export const useUserSignIn = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await signInAction(formData);
            if (!result.success) {
                throw new Error(result.message);
            }
            // Check user authentication after sign in
            try {
                await requireUserAction();
            } catch (error) {
                throw new Error('Authentication failed');
            }
            return result;
        },
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await forgotPasswordAction(formData);
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await resetPasswordAction(formData);
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        },
    });
};

export const useUserSignOut = () => {
    return useMutation({
        mutationFn: async () => {
            const result = await signOutAction();
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        },
    });
};

export const useSetupPassword = () => {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await setupPasswordAction(formData);
            if (!result.success) {
                throw new Error(result.message);
            }
            return result;
        },
    });
};

export const useGetSession = () => {
    return useQuery({
        queryKey: ['user-session'],
        queryFn: async () => {
            try {
                return await requireUserAction();
            } catch (error) {
                throw new Error(error instanceof Error ? error.message : 'User not authenticated');
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};