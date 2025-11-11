'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
    adminAffiliationList,
    adminAffiliationDetails,
    adminAffiliationCreate,
    adminAffiliationUpdate,
    adminAffiliationDelete,
    adminAffiliationCheckConstraints,
    adminAffiliationsAll,
} from '../../lib/server-actions/admin/affiliations-optimized';
import type {
    AffiliationQueryParams,
    AffiliationCreateData,
    AffiliationUpdateData,
} from '../../lib/types/affiliations';
import { ApiResponse } from '@/lib/types';

// Query key structure
const affiliationQueryKeys = {
    all: ['affiliations'] as const,
    lists: () => [...affiliationQueryKeys.all, 'list'] as const,
    list: (params: AffiliationQueryParams) =>
        [...affiliationQueryKeys.lists(), params] as const,
    details: () => [...affiliationQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...affiliationQueryKeys.details(), id] as const,
    byType: (type: string) =>
        [...affiliationQueryKeys.all, 'type', type] as const,
    metrics: () => [...affiliationQueryKeys.all, 'metrics'] as const,
    constraintCheck: (id: string) =>
        [...affiliationQueryKeys.all, 'constraint-check', id] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
    onAffiliationCreate: [affiliationQueryKeys.all],
    onAffiliationUpdate: (id: string) => [
        affiliationQueryKeys.all,
        affiliationQueryKeys.detail(id),
    ],
    onAffiliationDelete: (id: string) => [
        affiliationQueryKeys.all,
        affiliationQueryKeys.detail(id),
    ],
};

// list all affiliations without pagination
export function useAdminAffiliationsAll() {
    return useQuery({
        queryKey: affiliationQueryKeys.all,
        queryFn: async () => adminAffiliationsAll(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

// FIltering and paginated List operations
export function useAdminAffiliationList(params: AffiliationQueryParams) {
    return useQuery({
        queryKey: affiliationQueryKeys.list(params),
        queryFn: async () => adminAffiliationList(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminAffiliationSearch(params: AffiliationQueryParams) {
    return useQuery({
        queryKey: affiliationQueryKeys.list(params),
        queryFn: async () => adminAffiliationList(params),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

// Detail operations
export function useAdminAffiliationDetails(id: string) {
    return useQuery({
        queryKey: affiliationQueryKeys.detail(id),
        queryFn: async () => adminAffiliationDetails(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!id,
    });
}

// Mutation operations
export function useAdminAffiliationUpsert() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: AffiliationCreateData | AffiliationUpdateData
        ) => {
            if ('id' in data && data.id) {
                const result = await adminAffiliationUpdate(
                    data as AffiliationUpdateData
                );
                if (result.success && result.data) {
                    return result;
                } else {
                    throw new Error(
                        result.error || 'Failed to update affiliation'
                    );
                }
            } else {
                const result = await adminAffiliationCreate(
                    data as AffiliationCreateData
                );
                if (result.success && result.data) {
                    return result;
                } else {
                    throw new Error(
                        result.error || 'Failed to create affiliation'
                    );
                }
            }
        },
        onSuccess: async (result: ApiResponse<any>) => {
            if (result.success && result.data) {
                const id = result.data.id;
                // Invalidate specific and general affiliation queries
                await queryClient.invalidateQueries({
                    queryKey: affiliationQueryKeys.detail(id),
                });
                await queryClient.invalidateQueries({
                    queryKey: affiliationQueryKeys.all,
                });
            }
        },
    });
}
export function useAdminAffiliationCreate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AffiliationCreateData) => {
            const result = await adminAffiliationCreate(data);
            if (result.success && result.data) {
                return result;
            } else {
                throw new Error(result.error || 'Failed to create affiliation');
            }
        },
        onSuccess: async () => {
            // Invalidate all affiliation queries
            await queryClient.invalidateQueries({
                queryKey: affiliationQueryKeys.all,
            });
        },
    });
}

export function useAdminAffiliationUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: AffiliationUpdateData) => {
            const result = await adminAffiliationUpdate(data);
            if (result.success && result.data) {
                return result;
            } else {
                throw new Error(result.error || 'Failed to update affiliation');
            }
        },
        onSuccess: async (result: ApiResponse<any>) => {
            if (result.success && result.data) {
                // Invalidate specific affiliation queries
                await queryClient.invalidateQueries({
                    queryKey: affiliationQueryKeys.detail(result.data.id),
                });
                await queryClient.invalidateQueries({
                    queryKey: affiliationQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminAffiliationDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await adminAffiliationDelete(id);
            if (result.success) {
                return result;
            } else {
                throw new Error(
                    `Failed to delete affiliation with id ${id}: ${result.error}`
                );
            }
        },
        onSuccess: async (result: ApiResponse<any>, variables) => {
            if (result.success) {
                // Invalidate specific affiliation queries
                await queryClient.invalidateQueries({
                    queryKey: affiliationQueryKeys.detail(variables),
                });
                await queryClient.invalidateQueries({
                    queryKey: affiliationQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminAffiliationConstraintCheck(id: string) {
    return useQuery({
        queryKey: affiliationQueryKeys.constraintCheck(id),
        queryFn: async () => adminAffiliationCheckConstraints(id),
        enabled: !!id, // Only run when ID is provided
    });
}

// Specialized operations
export function useAdminAffiliationMetrics() {
    return useQuery({
        queryKey: affiliationQueryKeys.metrics(),
        queryFn: async () => {
            // This would call a specialized server action for metrics
            // Implementation would depend on specific requirements
            return { success: true, data: { total: 0, byType: {} } };
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminAffiliationExport() {
    // This would be a mutation hook for export functionality
    // Implementation would depend on specific requirements
    return useMutation({
        mutationFn: async (params: any) => {
            // Export implementation
            return { success: true, data: '' };
        },
    });
}
