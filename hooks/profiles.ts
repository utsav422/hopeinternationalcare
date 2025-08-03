'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminGetAllProfiles,
  adminGetProfileById,
  adminGetProfiles,
  adminUpdateProfile,
} from '@/server-actions/admin/profiles';
import type { profiles as profilesTable } from '@/utils/db/schema/profiles';
import { queryKeys } from './query-keys';

type ProfileWithDetails = typeof profilesTable.$inferSelect;

type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export const useGetProfiles = (params: ListParams) => {
  return useQuery({
    queryKey: queryKeys.profiles.list(params),
    queryFn: () => adminGetProfiles(params),
  });
};

export const useGetAllProfiles = () => {
  return useQuery({
    queryKey: queryKeys.profiles.lists(),
    queryFn: () => adminGetAllProfiles(),
  });
};

export const useGetProfileById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.profiles.detail(id),
    queryFn: () => adminGetProfileById(id),
    enabled: !!(id && id.length > 0),
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
      updates: Partial<ProfileWithDetails>;
    }) => adminUpdateProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });
};
