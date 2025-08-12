'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ZodSelectProfileType } from '@/lib/db/drizzle-zod-schema/profiles';
import { queryKeys } from '@/lib/query-keys';
import {
  adminGetAllProfiles,
  adminGetProfileById,
  adminGetProfiles,
  adminUpdateProfile,
} from '@/lib/server-actions/admin/profiles';

export const useGetProfiles = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) => {
  return useSuspenseQuery({
    queryKey: queryKeys.profiles.list(params),
    queryFn: async () => {
      const result = await adminGetProfiles(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetAllProfiles = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.profiles.all,
    queryFn: async () => {
      const result = await adminGetAllProfiles();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetProfileById = (id: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.profiles.detail(id),
    queryFn: async () => {
      const result = await adminGetProfileById(id);
      if (!result.success) {
        throw new Error(result.error);
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
