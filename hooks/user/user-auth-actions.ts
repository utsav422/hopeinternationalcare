'use client';
import { useMutation } from '@tanstack/react-query';
import {
  forgotPasswordAction,
  resetPasswordAction,
  setupPasswordAction,
  signInAction,
  signOutAction,
  signUpAction,
} from '@/lib/server-actions/user/user-auth-actions';

export const useUserSignUp = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await signUpAction(formData);
      if (!result.success) {
        throw new Error(result.error);
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
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await forgotPasswordAction(formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await resetPasswordAction(formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useUserSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      const result = await signOutAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useSetupPassword = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await setupPasswordAction(formData);
      if (!result.success) {
        throw new Error(result.error as string);
      }
      return result.data;
    },
  });
};
