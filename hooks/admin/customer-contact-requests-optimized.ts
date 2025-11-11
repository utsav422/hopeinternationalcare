'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
    adminCustomerContactRequestList,
    adminCustomerContactRequestDetails,
    adminCustomerContactRequestCreate,
    adminCustomerContactRequestUpdate,
    adminCustomerContactRequestDelete,
    adminCustomerContactRequestCheckConstraints,
    adminCustomerContactRequestUpdateStatus,
} from '@/lib/server-actions/admin/customer-contact-requests-optimized';
import type {
    CustomerContactRequestQueryParams,
    CustomerContactRequestCreateData,
    CustomerContactRequestUpdateData,
    CustomerContactRequestStatusUpdate,
} from '@/lib/types/customer-contact-requests';

// Query key structure
const customerContactRequestQueryKeys = {
    all: ['customer-contact-requests'] as const,
    lists: () => [...customerContactRequestQueryKeys.all, 'list'] as const,
    list: (params: CustomerContactRequestQueryParams) =>
        [...customerContactRequestQueryKeys.lists(), params] as const,
    details: () => [...customerContactRequestQueryKeys.all, 'detail'] as const,
    detail: (id: string) =>
        [...customerContactRequestQueryKeys.details(), id] as const,
    byStatus: (status: string) =>
        [...customerContactRequestQueryKeys.all, 'status', status] as const,
    metrics: () => [...customerContactRequestQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
    onRequestCreate: [customerContactRequestQueryKeys.all],
    onRequestUpdate: (id: string) => [
        customerContactRequestQueryKeys.all,
        customerContactRequestQueryKeys.detail(id),
    ],
    onRequestDelete: (id: string) => [
        customerContactRequestQueryKeys.all,
        customerContactRequestQueryKeys.detail(id),
    ],
    onRequestStatusUpdate: (id: string) => [
        customerContactRequestQueryKeys.all,
        customerContactRequestQueryKeys.detail(id),
    ],
};

// List operations
export function useAdminCustomerContactRequestList(
    params: CustomerContactRequestQueryParams
) {
    return useQuery({
        queryKey: customerContactRequestQueryKeys.list(params),
        queryFn: async () => adminCustomerContactRequestList(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminCustomerContactRequestSearch(search: string) {
    return useQuery({
        queryKey: customerContactRequestQueryKeys.list({ search }),
        queryFn: async () => adminCustomerContactRequestList({ search }),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

// Detail operations
export function useAdminCustomerContactRequestDetails(id: string) {
    return useQuery({
        queryKey: customerContactRequestQueryKeys.detail(id),
        queryFn: async () => adminCustomerContactRequestDetails(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!id,
    });
}

// Mutation operations
export function useAdminCustomerContactRequestCreate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CustomerContactRequestCreateData) =>
            adminCustomerContactRequestCreate(data),
        onSuccess: async () => {
            // Invalidate all customer contact request queries
            await queryClient.invalidateQueries({
                queryKey: customerContactRequestQueryKeys.all,
            });
        },
    });
}

export function useAdminCustomerContactRequestUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CustomerContactRequestUpdateData) =>
            adminCustomerContactRequestUpdate(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific customer contact request queries
                await queryClient.invalidateQueries({
                    queryKey: customerContactRequestQueryKeys.detail(
                        result.data.id
                    ),
                });
                await queryClient.invalidateQueries({
                    queryKey: customerContactRequestQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminCustomerContactRequestDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminCustomerContactRequestDelete(id),
        onSuccess: async (result, variables) => {
            if (result.success) {
                // Invalidate specific customer contact request queries
                await queryClient.invalidateQueries({
                    queryKey: customerContactRequestQueryKeys.detail(variables),
                });
                await queryClient.invalidateQueries({
                    queryKey: customerContactRequestQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminCustomerContactRequestConstraintCheck(id: string) {
    return useQuery({
        queryKey: [...customerContactRequestQueryKeys.all, 'constraint-check'],
        queryFn: async () => adminCustomerContactRequestCheckConstraints(id),
        enabled: !!id, // Only run when explicitly called
    });
}

// Status update operations
export function useAdminCustomerContactRequestUpdateStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CustomerContactRequestStatusUpdate) =>
            adminCustomerContactRequestUpdateStatus(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific customer contact request queries
                await queryClient.invalidateQueries({
                    queryKey: customerContactRequestQueryKeys.detail(
                        result.data.id
                    ),
                });
                await queryClient.invalidateQueries({
                    queryKey: customerContactRequestQueryKeys.all,
                });
            }
        },
    });
}

// Specialized operations
export function useAdminCustomerContactRequestMetrics() {
    return useQuery({
        queryKey: customerContactRequestQueryKeys.metrics(),
        queryFn: async () => {
            // This would call a specialized server action for metrics
            // Implementation would depend on specific requirements
            return { success: true, data: { total: 0, byStatus: {} } };
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminCustomerContactRequestExport() {
    // This would be a mutation hook for export functionality
    // Implementation would depend on specific requirements
    return useMutation({
        mutationFn: async (params: any) => {
            // Export implementation
            return { success: true, data: '' };
        },
    });
}
