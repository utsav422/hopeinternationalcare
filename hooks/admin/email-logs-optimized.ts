'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
    adminEmailLogList,
    adminEmailLogDetails,
    adminEmailLogCreate,
    adminEmailLogUpdate,
    adminEmailLogDelete,
    adminEmailLogCheckConstraints,
    adminEmailLogUpdateStatus,
} from '@/lib/server-actions/admin/email-logs-optimized';
import type {
    EmailLogQueryParams,
    EmailLogCreateData,
    EmailLogUpdateData,
    EmailLogStatusUpdate,
} from '@/lib/types/email-logs';

// Query key structure
const emailLogQueryKeys = {
    all: ['email-logs'] as const,
    lists: () => [...emailLogQueryKeys.all, 'list'] as const,
    list: (params: EmailLogQueryParams) =>
        [...emailLogQueryKeys.lists(), params] as const,
    details: () => [...emailLogQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...emailLogQueryKeys.details(), id] as const,
    byStatus: (status: string) =>
        [...emailLogQueryKeys.all, 'status', status] as const,
    metrics: () => [...emailLogQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
    onLogCreate: [emailLogQueryKeys.all],
    onLogUpdate: (id: string) => [
        emailLogQueryKeys.all,
        emailLogQueryKeys.detail(id),
    ],
    onLogDelete: (id: string) => [
        emailLogQueryKeys.all,
        emailLogQueryKeys.detail(id),
    ],
    onLogStatusUpdate: (id: string) => [
        emailLogQueryKeys.all,
        emailLogQueryKeys.detail(id),
    ],
};

// List operations
export function useAdminEmailLogList(params: EmailLogQueryParams) {
    return useQuery({
        queryKey: emailLogQueryKeys.list(params),
        queryFn: async () => adminEmailLogList(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminEmailLogSearch(search: string) {
    return useQuery({
        queryKey: emailLogQueryKeys.list({ search }),
        queryFn: async () => adminEmailLogList({ search }),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

// Detail operations
export function useAdminEmailLogDetails(id: string) {
    return useQuery({
        queryKey: emailLogQueryKeys.detail(id),
        queryFn: async () => adminEmailLogDetails(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!id,
    });
}

// Mutation operations
export function useAdminEmailLogCreate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmailLogCreateData) => adminEmailLogCreate(data),
        onSuccess: async () => {
            // Invalidate all email log queries
            await queryClient.invalidateQueries({
                queryKey: emailLogQueryKeys.all,
            });
        },
    });
}

export function useAdminEmailLogUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmailLogUpdateData) => adminEmailLogUpdate(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific email log queries
                await queryClient.invalidateQueries({
                    queryKey: emailLogQueryKeys.detail(result.data.id),
                });
                await queryClient.invalidateQueries({
                    queryKey: emailLogQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminEmailLogDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminEmailLogDelete(id),
        onSuccess: async (result, variables) => {
            if (result.success) {
                // Invalidate specific email log queries
                await queryClient.invalidateQueries({
                    queryKey: emailLogQueryKeys.detail(variables),
                });
                await queryClient.invalidateQueries({
                    queryKey: emailLogQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminEmailLogConstraintCheck(id: string) {
    return useQuery({
        queryKey: [...emailLogQueryKeys.all, 'constraint-check'],
        queryFn: async () => adminEmailLogCheckConstraints(id),
        enabled: !!id, // Only run when id is available
    });
}

// Status update operations
export function useAdminEmailLogUpdateStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EmailLogStatusUpdate) =>
            adminEmailLogUpdateStatus(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific email log queries
                await queryClient.invalidateQueries({
                    queryKey: emailLogQueryKeys.detail(result.data.id),
                });
                await queryClient.invalidateQueries({
                    queryKey: emailLogQueryKeys.all,
                });
            }
        },
    });
}

// Specialized operations
export function useAdminEmailLogMetrics() {
    return useQuery({
        queryKey: emailLogQueryKeys.metrics(),
        queryFn: async () => {
            // This would call a specialized server action for metrics
            // Implementation would depend on specific requirements
            return { success: true, data: { total: 0, byStatus: {} } };
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminEmailLogExport() {
    // This would be a mutation hook for export functionality
    // Implementation would depend on specific requirements
    return useMutation({
        mutationFn: async (params: any) => {
            // Export implementation
            return { success: true, data: '' };
        },
    });
}
