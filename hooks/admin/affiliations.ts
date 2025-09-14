'use client';

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { queryKeys } from '@/lib/query-keys';
import {
  deleteAffiliation,
  getAffiliationById,
  getAffiliations,
  getAffiliationsPaginated,
  upsertAffiliation,
  adminAffiliationList
} from '@/lib/server-actions/admin/affiliations';
import type { AffiliationFormData } from '@/lib/server-actions/admin/affiliations';

// Types
export type AffiliationQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

// Enhanced types for the new adminAffiliationList function
type ListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  filters?: ColumnFiltersState;
};

// Hooks for affiliations
export const useAdminAffiliations = (params: ListParams) => {
  return useQuery({
    queryKey: queryKeys.affiliations.list(params),
    queryFn: async () => adminAffiliationList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useAdminAffiliationById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.affiliations.detail(id),
    queryFn: async () => getAffiliationById(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
};

export const useAdminAffiliationsAll = () => {
  return useQuery({
    queryKey: queryKeys.affiliations.lists(),
    queryFn: async () => getAffiliations(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useAdminAffiliationUpsert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AffiliationFormData) => upsertAffiliation(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.affiliations.all,
      });
    },
  });
};

export const useAdminAffiliationDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteAffiliation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.affiliations.all,
      });
    },
  });
};