'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
    adminCourseCategoryList,
    adminCourseCategoryDetails,
    adminCourseCategoryCreate,
    adminCourseCategoryUpdate,
    adminCourseCategoryDelete,
    adminCourseCategoryCheckConstraints,
} from '@/lib/server-actions/admin/course-categories-optimized';
import type {
    CourseCategoryQueryParams,
    CourseCategoryCreateData,
    CourseCategoryUpdateData,
} from '@/lib/types/course-categories';

// Query key structure
const courseCategoryQueryKeys = {
    all: ['course-categories'] as const,
    lists: () => [...courseCategoryQueryKeys.all, 'list'] as const,
    list: (params: CourseCategoryQueryParams) =>
        [...courseCategoryQueryKeys.lists(), params] as const,
    details: () => [...courseCategoryQueryKeys.all, 'detail'] as const,
    detail: (id?: string) =>
        [...courseCategoryQueryKeys.details(), id ?? ''] as const,
    byName: (name: string) =>
        [...courseCategoryQueryKeys.all, 'name', name] as const,
    metrics: () => [...courseCategoryQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
    onCategoryCreate: [courseCategoryQueryKeys.all],
    onCategoryUpdate: (id: string) => [
        courseCategoryQueryKeys.all,
        courseCategoryQueryKeys.detail(id),
    ],
    onCategoryDelete: (id: string) => [
        courseCategoryQueryKeys.all,
        courseCategoryQueryKeys.detail(id),
    ],
};

// List operations
export function useAdminCourseCategoryList(params: CourseCategoryQueryParams) {
    return useQuery({
        queryKey: courseCategoryQueryKeys.list(params),
        queryFn: async () => adminCourseCategoryList(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminCourseCategorySearch(search: string) {
    return useQuery({
        queryKey: courseCategoryQueryKeys.list({ search }),
        queryFn: async () => adminCourseCategoryList({ search }),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

// Detail operations
export function useAdminCourseCategoryDetails(id?: string) {
    return useQuery({
        queryKey: courseCategoryQueryKeys.detail(id ?? ''),
        queryFn: async () => adminCourseCategoryDetails(id ?? ''),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!id && id !== '',
    });
}

// Mutation operations
export function useAdminCourseCategoryCreate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CourseCategoryCreateData) => {
            const result = await adminCourseCategoryCreate(data);
            if (result.success && result.data) {
                return result;
            } else {
                throw new Error(result.error || 'Failed to create category');
            }
        },
        onSuccess: async () => {
            // Invalidate all course category queries
            await queryClient.invalidateQueries({
                queryKey: courseCategoryQueryKeys.all,
            });
        },
    });
}

export function useAdminCourseCategoryUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CourseCategoryUpdateData) => {
            const result = await adminCourseCategoryUpdate(data);
            if (result.success && result.data) {
                return result;
            } else {
                throw new Error(result.error || 'Failed to update category');
            }
        },
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific course category queries
                await queryClient.invalidateQueries({
                    queryKey: courseCategoryQueryKeys.detail(
                        result.data.id as string
                    ),
                });
                await queryClient.invalidateQueries({
                    queryKey: courseCategoryQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminCourseCategoryDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await adminCourseCategoryDelete(id);
            if (result.success) {
                return result;
            } else {
                throw new Error(
                    `Failed to delete category with id ${id}: ${result.error}`
                );
            }
        },
        onSuccess: async (result, variables) => {
            if (result.success) {
                // Invalidate specific course category queries
                await queryClient.invalidateQueries({
                    queryKey: courseCategoryQueryKeys.detail(variables),
                });
                await queryClient.invalidateQueries({
                    queryKey: courseCategoryQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminCourseCategoryConstraintCheck(id: string) {
    return useQuery({
        queryKey: [...courseCategoryQueryKeys.all, 'constraint-check'],
        queryFn: async () => await adminCourseCategoryCheckConstraints(id),
        enabled: !!id, // Only run when explicitly called
    });
}

// Specialized operations
export function useAdminCourseCategoryMetrics() {
    return useQuery({
        queryKey: courseCategoryQueryKeys.metrics(),
        queryFn: async () => {
            // This would call a specialized server action for metrics
            // Implementation would depend on specific requirements
            return { success: true, data: { total: 0 } };
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminCourseCategoryExport() {
    // This would be a mutation hook for export functionality
    // Implementation would depend on specific requirements
    return useMutation({
        mutationFn: async (params: any) => {
            // Export implementation
            return { success: true, data: '' };
        },
    });
}
