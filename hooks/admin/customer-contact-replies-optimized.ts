'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
    adminCustomerContactReplyList,
    adminCustomerContactReplyDetails,
    adminCustomerContactReplyCreate,
    adminCustomerContactReplyUpdate,
    adminCustomerContactReplyDelete,
    adminCustomerContactReplyCheckConstraints,
    adminCustomerContactReplyUpdateStatus,
    adminCustomerContactReplyCreateBatch,
} from '@/lib/server-actions/admin/customer-contact-replies-optimized';
import type {
    CustomerContactReplyQueryParams,
    CustomerContactReplyCreateData,
    CustomerContactReplyUpdateData,
    CustomerContactReplyStatusUpdate,
} from '@/lib/types/customer-contact-replies';

// Query key structure
const customerContactReplyQueryKeys = {
    all: ['customer-contact-replies'] as const,
    lists: () => [...customerContactReplyQueryKeys.all, 'list'] as const,
    list: (params: CustomerContactReplyQueryParams) =>
        [...customerContactReplyQueryKeys.lists(), params] as const,
    details: () => [...customerContactReplyQueryKeys.all, 'detail'] as const,
    detail: (id: string) =>
        [...customerContactReplyQueryKeys.details(), id] as const,
    byRequest: (requestId: string) =>
        [...customerContactReplyQueryKeys.all, 'request', requestId] as const,
    metrics: () => [...customerContactReplyQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
    onReplyCreate: [customerContactReplyQueryKeys.all],
    onReplyUpdate: (id: string) => [
        customerContactReplyQueryKeys.all,
        customerContactReplyQueryKeys.detail(id),
    ],
    onReplyDelete: (id: string) => [
        customerContactReplyQueryKeys.all,
        customerContactReplyQueryKeys.detail(id),
    ],
    onReplyStatusUpdate: (id: string) => [
        customerContactReplyQueryKeys.all,
        customerContactReplyQueryKeys.detail(id),
    ],
};

// List operations
export function useAdminCustomerContactReplyList(
    params: CustomerContactReplyQueryParams
) {
    return useQuery({
        queryKey: customerContactReplyQueryKeys.list(params),
        queryFn: async () => adminCustomerContactReplyList(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminCustomerContactReplySearch(search: string) {
    return useQuery({
        queryKey: customerContactReplyQueryKeys.list({ search }),
        queryFn: async () => adminCustomerContactReplyList({ search }),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}
export function useAdminCustomerContactReplyBatchReply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => adminCustomerContactReplyCreateBatch(data),
        onSuccess: async () => {
            // Invalidate all customer contact reply queries
            await queryClient.invalidateQueries({
                queryKey: customerContactReplyQueryKeys.all,
            });
        },
    });
}

// Detail operations
export function useAdminCustomerContactReplyDetails(id: string) {
    return useQuery({
        queryKey: customerContactReplyQueryKeys.detail(id),
        queryFn: async () => adminCustomerContactReplyDetails(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!id,
    });
}

// Mutation operations
export function useAdminCustomerContactReplyCreate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CustomerContactReplyCreateData) =>
            adminCustomerContactReplyCreate(data),
        onSuccess: async () => {
            // Invalidate all customer contact reply queries
            await queryClient.invalidateQueries({
                queryKey: customerContactReplyQueryKeys.all,
            });
        },
    });
}

export function useAdminCustomerContactReplyUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CustomerContactReplyUpdateData) =>
            adminCustomerContactReplyUpdate(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific customer contact reply queries
                await queryClient.invalidateQueries({
                    queryKey: customerContactReplyQueryKeys.detail(
                        result.data.id
                    ),
                });
                await queryClient.invalidateQueries({
                    queryKey: customerContactReplyQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminCustomerContactReplyDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminCustomerContactReplyDelete(id),
        onSuccess: async (result, variables) => {
            if (result.success) {
                // Invalidate specific customer contact reply queries
                await queryClient.invalidateQueries({
                    queryKey: customerContactReplyQueryKeys.detail(variables),
                });
                await queryClient.invalidateQueries({
                    queryKey: customerContactReplyQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminCustomerContactReplyConstraintCheck(id: string) {
    return useQuery({
        queryKey: [...customerContactReplyQueryKeys.all, 'constraint-check'],
        queryFn: async () => adminCustomerContactReplyCheckConstraints(id),
        enabled: !!id, // Only run when explicitly called
    });
}

// Status update operations
export function useAdminCustomerContactReplyUpdateStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CustomerContactReplyStatusUpdate) =>
            adminCustomerContactReplyUpdateStatus(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific customer contact reply queries
                await queryClient.invalidateQueries({
                    queryKey: customerContactReplyQueryKeys.detail(
                        result.data.id
                    ),
                });
                await queryClient.invalidateQueries({
                    queryKey: customerContactReplyQueryKeys.all,
                });
            }
        },
    });
}

// Specialized operations
export function useAdminCustomerContactReplyMetrics() {
    return useQuery({
        queryKey: customerContactReplyQueryKeys.metrics(),
        queryFn: async () => {
            // This would call a specialized server action for metrics
            // Implementation would depend on specific requirements
            return { success: true, data: { total: 0, sent: 0 } };
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminCustomerContactReplyExport() {
    // This would be a mutation hook for export functionality
    // Implementation would depend on specific requirements
    return useMutation({
        mutationFn: async (params: any) => {
            // Export implementation
            return { success: true, data: '' };
        },
    });
}
