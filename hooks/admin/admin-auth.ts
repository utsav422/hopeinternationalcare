'use client';
import { useMutation } from '@tanstack/react-query';
import {
  inviteUserAction,
  signInAction,
  signOutAction,
  signUpAction,
} from '@/lib/server-actions/admin/admin-auth-actions';

export const useSignUp = () => {
  return useMutation({
    mutationFn: (formData: FormData) => signUpAction(formData),
  });
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: (formData: FormData) => signInAction(formData),
  });
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: () => signOutAction(),
  });
};

export const useInviteUser = () => {
  return useMutation({
    mutationFn: (formData: FormData) => inviteUserAction(formData),
  });
};
