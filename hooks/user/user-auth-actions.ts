'use client';
import { useMutation } from '@tanstack/react-query';
import {
  forgotPasswordAction,
  resetPasswordAction,
  setupPassword,
  signInAction,
  signOutAction,
  signUpAction,
} from '@/server-actions/user/user-auth-actions';

export const useUserSignUp = () => {
  return useMutation({
    mutationFn: (formData: FormData) => signUpAction(formData),
  });
};

export const useUserSignIn = () => {
  return useMutation({
    mutationFn: (formData: FormData) => signInAction(formData),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (formData: FormData) => forgotPasswordAction(formData),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (formData: FormData) => resetPasswordAction(formData),
  });
};

export const useUserSignOut = () => {
  return useMutation({
    mutationFn: () => signOutAction(),
  });
};

export const useSetupPassword = () => {
  return useMutation({
    mutationFn: (formData: FormData) => setupPassword(formData),
  });
};
