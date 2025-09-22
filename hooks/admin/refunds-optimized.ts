'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { 
  adminRefundList, 
  adminRefundDetails, 
  adminRefundCreate, 
  adminRefundUpdate, 
  adminRefundDelete, 
  adminRefundCheckConstraints,
  adminRefundUpdateStatus
} from '@/lib/server-actions/admin/refunds-optimized';
import type { 
  RefundQueryParams, 
  RefundCreateData, 
  RefundUpdateData,
  RefundStatusUpdate
} from '@/lib/types/refunds';

// Query key structure
const refundQueryKeys = {
  all: ['refunds'] as const,
  lists: () => [...refundQueryKeys.all, 'list'] as const,
  list: (params: RefundQueryParams) => [...refundQueryKeys.lists(), params] as const,
  details: () => [...refundQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...refundQueryKeys.details(), id] as const,
  byStatus: (status: string) => [...refundQueryKeys.all, 'status', status] as const,
  byUser: (userId: string) => [...refundQueryKeys.all, 'user', userId] as const,
  metrics: () => [...refundQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
  onRefundCreate: [refundQueryKeys.all],
  onRefundUpdate: (id: string) => [
    refundQueryKeys.all,
    refundQueryKeys.detail(id)
  ],
  onRefundDelete: (id: string) => [
    refundQueryKeys.all,
    refundQueryKeys.detail(id)
  ],
  onRefundStatusUpdate: (id: string) => [
    refundQueryKeys.all,
    refundQueryKeys.detail(id)
  ],
};

// List operations
export function useAdminRefundList(params: RefundQueryParams) {
  return useQuery({
    queryKey: refundQueryKeys.list(params),
    queryFn: async () => adminRefundList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminRefundSearch(search: string) {
  return useQuery({
    queryKey: refundQueryKeys.list({ search }),
    queryFn: async () => adminRefundList({ search }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Detail operations
export function useAdminRefundDetails(id: string) {
  return useQuery({
    queryKey: refundQueryKeys.detail(id),
    queryFn: async () => adminRefundDetails(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
}

// Mutation operations
export function useAdminRefundCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RefundCreateData) => adminRefundCreate(data),
    onSuccess: async () => {
      // Invalidate all refund queries
      await queryClient.invalidateQueries({
        queryKey: refundQueryKeys.all,
      });
    },
  });
}

export function useAdminRefundUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RefundUpdateData) => adminRefundUpdate(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific refund queries
        await queryClient.invalidateQueries({
          queryKey: refundQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: refundQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminRefundDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminRefundDelete(id),
    onSuccess: async (result, variables) => {
      if (result.success) {
        // Invalidate specific refund queries
        await queryClient.invalidateQueries({
          queryKey: refundQueryKeys.detail(variables),
        });
        await queryClient.invalidateQueries({
          queryKey: refundQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminRefundConstraintCheck() {
  return useQuery({
    queryKey: [...refundQueryKeys.all, 'constraint-check'],
    queryFn: async (id: string) => adminRefundCheckConstraints(id),
    enabled: false, // Only run when explicitly called
  });
}

// Status update operations
export function useAdminRefundUpdateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RefundStatusUpdate) => adminRefundUpdateStatus(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific refund queries
        await queryClient.invalidateQueries({
          queryKey: refundQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: refundQueryKeys.all,
        });
      }
    },
  });
}

// Specialized operations
export function useAdminRefundMetrics() {
  return useQuery({
    queryKey: refundQueryKeys.metrics(),
    queryFn: async () => {
      // This would call a specialized server action for metrics
      // Implementation would depend on specific requirements
      return { success: true, data: { total: 0, byStatus: {}, totalAmount: 0 } };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminRefundExport() {
  // This would be a mutation hook for export functionality
  // Implementation would depend on specific requirements
  return useMutation({
    mutationFn: async (params: any) => {
      // Export implementation
      return { success: true, data: '' };
    },
  });
}