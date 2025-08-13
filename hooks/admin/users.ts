'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDeleteUser, createUser } from '@/lib/server-actions/admin/users';
import { queryKeys } from '../../lib/query-keys';

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createUser(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useGetUsers = (page?: number, pageSize?: number) => {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page?.toString() || '1',
        pageSize: pageSize?.toString() || '10',
      });
      const response = await fetch(`/api/admin/users?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch users');
      }
      return result;
    },
  });
};
