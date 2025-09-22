'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { 
  adminProfileList, 
  adminProfileDetails, 
  adminProfileCreate, 
  adminProfileUpdate, 
  adminProfileDelete, 
  adminProfileCheckConstraints
} from '@/lib/server-actions/admin/profiles-optimized';
import type { 
  ProfileQueryParams, 
  ProfileCreateData, 
  ProfileUpdateData
} from '@/lib/types/profiles';

// Query key structure
const profileQueryKeys = {
  all: ['profiles'] as const,
  lists: () => [...profileQueryKeys.all, 'list'] as const,
  list: (params: ProfileQueryParams) => [...profileQueryKeys.lists(), params] as const,
  details: () => [...profileQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...profileQueryKeys.details(), id] as const,
  byUser: (userId: string) => [...profileQueryKeys.all, 'user', userId] as const,
  metrics: () => [...profileQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
  onProfileCreate: [profileQueryKeys.all],
  onProfileUpdate: (id: string) => [
    profileQueryKeys.all,
    profileQueryKeys.detail(id)
  ],
  onProfileDelete: (id: string) => [
    profileQueryKeys.all,
    profileQueryKeys.detail(id)
  ],
};

// List operations
export function useAdminProfileList(params: ProfileQueryParams) {
  return useQuery({
    queryKey: profileQueryKeys.list(params),
    queryFn: async () => adminProfileList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminProfileSearch(search: string) {
  return useQuery({
    queryKey: profileQueryKeys.list({ search }),
    queryFn: async () => adminProfileList({ search }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Detail operations
export function useAdminProfileDetails(id: string) {
  return useQuery({
    queryKey: profileQueryKeys.detail(id),
    queryFn: async () => adminProfileDetails(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
}

// Mutation operations
export function useAdminProfileCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProfileCreateData) => adminProfileCreate(data),
    onSuccess: async () => {
      // Invalidate all profile queries
      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.all,
      });
    },
  });
}

export function useAdminProfileUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProfileUpdateData) => adminProfileUpdate(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific profile queries
        await queryClient.invalidateQueries({
          queryKey: profileQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: profileQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminProfileDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminProfileDelete(id),
    onSuccess: async (result, variables) => {
      if (result.success) {
        // Invalidate specific profile queries
        await queryClient.invalidateQueries({
          queryKey: profileQueryKeys.detail(variables),
        });
        await queryClient.invalidateQueries({
          queryKey: profileQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminProfileConstraintCheck() {
  return useQuery({
    queryKey: [...profileQueryKeys.all, 'constraint-check'],
    queryFn: async (id: string) => adminProfileCheckConstraints(id),
    enabled: false, // Only run when explicitly called
  });
}

// Specialized operations
export function useAdminProfileMetrics() {
  return useQuery({
    queryKey: profileQueryKeys.metrics(),
    queryFn: async () => {
      // This would call a specialized server action for metrics
      // Implementation would depend on specific requirements
      return { success: true, data: { total: 0, byNationality: {} } };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminProfileExport() {
  // This would be a mutation hook for export functionality
  // Implementation would depend on specific requirements
  return useMutation({
    mutationFn: async (params: any) => {
      // Export implementation
      return { success: true, data: '' };
    },
  });
}