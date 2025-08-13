'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ZodSelectProfileType } from '@/lib/db/drizzle-zod-schema/profiles';
import { queryKeys } from '@/lib/query-keys';
import { adminUpdateProfile } from '@/lib/server-actions/admin/profiles';

export const useGetProfiles = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) => {
  return useSuspenseQuery({
    queryKey: queryKeys.profiles.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: params.page?.toString() || '1',
        pageSize: params.pageSize?.toString() || '10',
        search: params.search || '',
      });
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const response = await fetch(
        `${baseUrl}/api/admin/profiles?${searchParams}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch profiles');
      }
      return result;
    },
  });
};

export const useGetAllProfiles = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.profiles.all,
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/admin/profiles?getAll=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch all profiles');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch all profiles');
      }
      return result.data;
    },
  });
};

export const useGetProfileById = (id: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.profiles.detail(id),
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const response = await fetch(`${baseUrl}/api/admin/profiles?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch profile');
      }
      return result.data;
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ZodSelectProfileType>;
    }) => adminUpdateProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });
};
