'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { 
  adminUserDeletionHistoryList, 
  adminUserDeletionHistoryDetails, 
  adminUserDeletionHistoryCreate, 
  adminUserDeletionHistoryUpdate, 
  adminUserDeletionHistoryDelete, 
  adminUserDeletionHistoryCheckConstraints,
  adminUserDeletionHistoryUpdateStatus
} from '@/lib/server-actions/admin/user-deletion-history-optimized';
import type { 
  UserDeletionHistoryQueryParams, 
  UserDeletionHistoryCreateData, 
  UserDeletionHistoryUpdateData,
  UserDeletionHistoryStatusUpdate
} from '@/lib/types/user-deletion-history';

// Query key structure
const userDeletionHistoryQueryKeys = {
  all: ['user-deletion-history'] as const,
  lists: () => [...userDeletionHistoryQueryKeys.all, 'list'] as const,
  list: (params: UserDeletionHistoryQueryParams) => [...userDeletionHistoryQueryKeys.lists(), params] as const,
  details: () => [...userDeletionHistoryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userDeletionHistoryQueryKeys.details(), id] as const,
  byStatus: (status: string) => [...userDeletionHistoryQueryKeys.all, 'status', status] as const,
  byUser: (userId: string) => [...userDeletionHistoryQueryKeys.all, 'user', userId] as const,
  metrics: () => [...userDeletionHistoryQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
  onDeletionCreate: [userDeletionHistoryQueryKeys.all],
  onDeletionUpdate: (id: string) => [
    userDeletionHistoryQueryKeys.all,
    userDeletionHistoryQueryKeys.detail(id)
  ],
  onDeletionDelete: (id: string) => [
    userDeletionHistoryQueryKeys.all,
    userDeletionHistoryQueryKeys.detail(id)
  ],
  onDeletionStatusUpdate: (id: string) => [
    userDeletionHistoryQueryKeys.all,
    userDeletionHistoryQueryKeys.detail(id)
  ],
};

// List operations
export function useAdminUserDeletionHistoryList(params: UserDeletionHistoryQueryParams) {
  return useQuery({
    queryKey: userDeletionHistoryQueryKeys.list(params),
    queryFn: async () => adminUserDeletionHistoryList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminUserDeletionHistorySearch(search: string) {
  return useQuery({
    queryKey: userDeletionHistoryQueryKeys.list({ search }),
    queryFn: async () => adminUserDeletionHistoryList({ search }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Detail operations
export function useAdminUserDeletionHistoryDetails(id: string) {
  return useQuery({
    queryKey: userDeletionHistoryQueryKeys.detail(id),
    queryFn: async () => adminUserDeletionHistoryDetails(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
}

// Mutation operations
export function useAdminUserDeletionHistoryCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserDeletionHistoryCreateData) => adminUserDeletionHistoryCreate(data),
    onSuccess: async () => {
      // Invalidate all user deletion history queries
      await queryClient.invalidateQueries({
        queryKey: userDeletionHistoryQueryKeys.all,
      });
    },
  });
}

export function useAdminUserDeletionHistoryUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserDeletionHistoryUpdateData) => adminUserDeletionHistoryUpdate(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific user deletion history queries
        await queryClient.invalidateQueries({
          queryKey: userDeletionHistoryQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: userDeletionHistoryQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminUserDeletionHistoryDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminUserDeletionHistoryDelete(id),
    onSuccess: async (result, variables) => {
      if (result.success) {
        // Invalidate specific user deletion history queries
        await queryClient.invalidateQueries({
          queryKey: userDeletionHistoryQueryKeys.detail(variables),
        });
        await queryClient.invalidateQueries({
          queryKey: userDeletionHistoryQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminUserDeletionHistoryConstraintCheck() {
  return useQuery({
    queryKey: [...userDeletionHistoryQueryKeys.all, 'constraint-check'],
    queryFn: async (id: string) => adminUserDeletionHistoryCheckConstraints(id),
    enabled: false, // Only run when explicitly called
  });
}

// Status update operations
export function useAdminUserDeletionHistoryUpdateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserDeletionHistoryStatusUpdate) => adminUserDeletionHistoryUpdateStatus(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific user deletion history queries
        await queryClient.invalidateQueries({
          queryKey: userDeletionHistoryQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: userDeletionHistoryQueryKeys.all,
        });
      }
    },
  });
}

// Specialized operations
export function useAdminUserDeletionHistoryMetrics() {
  return useQuery({
    queryKey: userDeletionHistoryQueryKeys.metrics(),
    queryFn: async () => {
      // This would call a specialized server action for metrics
      // Implementation would depend on specific requirements
      return { success: true, data: { total: 0, byStatus: {} } };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminUserDeletionHistoryExport() {
  // This would be a mutation hook for export functionality
  // Implementation would depend on specific requirements
  return useMutation({
    mutationFn: async (params: any) => {
      // Export implementation
      return { success: true, data: '' };
    },
  });
}