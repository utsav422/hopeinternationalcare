'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { 
  adminPaymentList, 
  adminPaymentDetails, 
  adminPaymentCreate, 
  adminPaymentUpdate, 
  adminPaymentDelete, 
  adminPaymentCheckConstraints,
  adminPaymentUpdateStatus,
  adminPaymentRefund,
  adminPaymentDetailsByEnrollmentId
} from '@/lib/server-actions/admin/payments-optimized';
import type { 
  PaymentQueryParams, 
  PaymentCreateData, 
  PaymentUpdateData,
  PaymentStatusUpdate,
  PaymentRefundData
} from '@/lib/types/payments';

// Query key structure
const paymentQueryKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentQueryKeys.all, 'list'] as const,
  list: (params: PaymentQueryParams) => [...paymentQueryKeys.lists(), params] as const,
  details: () => [...paymentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentQueryKeys.details(), id] as const,
  byStatus: (status: string) => [...paymentQueryKeys.all, 'status', status] as const,
  byUser: (userId: string) => [...paymentQueryKeys.all, 'user', userId] as const,
  metrics: () => [...paymentQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
  onPaymentCreate: [paymentQueryKeys.all],
  onPaymentUpdate: (id: string) => [
    paymentQueryKeys.all,
    paymentQueryKeys.detail(id)
  ],
  onPaymentDelete: (id: string) => [
    paymentQueryKeys.all,
    paymentQueryKeys.detail(id)
  ],
  onPaymentStatusUpdate: (id: string) => [
    paymentQueryKeys.all,
    paymentQueryKeys.detail(id)
  ],
  onPaymentRefund: (id: string) => [
    paymentQueryKeys.all,
    paymentQueryKeys.detail(id)
  ],
};

// List operations
export function useAdminPaymentList(params: PaymentQueryParams) {
  return useQuery({
    queryKey: paymentQueryKeys.list(params),
    queryFn: async () => adminPaymentList(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminPaymentSearch(search: string) {
  return useQuery({
    queryKey: paymentQueryKeys.list({ search }),
    queryFn: async () => adminPaymentList({ search }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Detail operations
export function useAdminPaymentDetails(id: string) {
  return useQuery({
    queryKey: paymentQueryKeys.detail(id),
    queryFn: async () => adminPaymentDetails(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!id,
  });
}

export function useAdminPaymentDetailsByEnrollmentId(enrollmentId: string) {
    return useQuery({
        queryKey: ['payments', 'detail', 'by-enrollment', enrollmentId],
        queryFn: async () => adminPaymentDetailsByEnrollmentId(enrollmentId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!enrollmentId,
    });
}

// Mutation operations
export function useAdminPaymentCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PaymentCreateData) => adminPaymentCreate(data),
    onSuccess: async () => {
      // Invalidate all payment queries
      await queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.all,
      });
    },
  });
}

export function useAdminPaymentUpdate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PaymentUpdateData) => adminPaymentUpdate(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific payment queries
        await queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminPaymentDelete() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminPaymentDelete(id),
    onSuccess: async (result, variables) => {
      if (result.success) {
        // Invalidate specific payment queries
        await queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.detail(variables),
        });
        await queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.all,
        });
      }
    },
  });
}

export function useAdminPaymentConstraintCheck(id: string) {
  return useQuery({
    queryKey: [...paymentQueryKeys.all, 'constraint-check', id],
    queryFn: async () => adminPaymentCheckConstraints(id),
    enabled: !!id,
  });
}

// Status update operations
export function useAdminPaymentUpdateStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PaymentStatusUpdate) => adminPaymentUpdateStatus(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate specific payment queries
        await queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.detail(result.data.id),
        });
        await queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.all,
        });
      }
    },
  });
}

// Refund operations
export function useAdminPaymentRefund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PaymentRefundData) => adminPaymentRefund(data),
    onSuccess: async (result) => {
      if (result.success && result.data) {
        // Invalidate all payment queries
        await queryClient.invalidateQueries({
          queryKey: paymentQueryKeys.all,
        });
      }
    },
  });
}

// Specialized operations
export function useAdminPaymentMetrics() {
  return useQuery({
    queryKey: paymentQueryKeys.metrics(),
    queryFn: async () => {
      // This would call a specialized server action for metrics
      // Implementation would depend on specific requirements
      return { success: true, data: { total: 0, byStatus: {}, revenue: 0 } };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useAdminPaymentExport() {
  // This would be a mutation hook for export functionality
  // Implementation would depend on specific requirements
  return useMutation({
    mutationFn: async (params: any) => {
      // Export implementation
      return { success: true, data: '' };
    },
  });
}