'use client';

import {
    useMutation,
    useQuery,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
    adminIntakeList,
    adminIntakeDetails,
    adminIntakeCreate,
    adminIntakeUpdate,
    adminIntakeDelete,
    adminIntakeCheckConstraints,
    adminIntakeUpdateStatus,
} from '@/lib/server-actions/admin/intakes-optimized';
import type {
    IntakeQueryParams,
    IntakeCreateData,
    IntakeUpdateData,
    IntakeStatusUpdate,
    IntakeGenerationResult,
    IntakesByCourseAndYearResponse,
} from '@/lib/types/intakes';
import {
    adminIntakeGenerateForCourse,
    adminIntakeGenerateForCourseAdvanced,
    adminIntakeUpsert,
    adminIntakesByCourseAndYear,
    adminIntakeListAllActive,
} from '@/lib/server-actions/admin/intakes-optimized';
import { courseQueryKeys } from './courses-optimized';

// Query key structure
const intakeQueryKeys = {
    all: ['intakes'] as const,
    lists: () => [...intakeQueryKeys.all, 'list'] as const,
    list: (params: IntakeQueryParams) =>
        [...intakeQueryKeys.lists(), params] as const,
    details: () => [...intakeQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...intakeQueryKeys.details(), id] as const,
    byCourse: (courseId: string) =>
        [...intakeQueryKeys.all, 'course', courseId] as const,
    active: () => [...intakeQueryKeys.all, 'active'] as const,
    metrics: () => [...intakeQueryKeys.all, 'metrics'] as const,
};

// Cache invalidation patterns
const invalidationPatterns = {
    onIntakeCreate: [intakeQueryKeys.all],
    onIntakeUpdate: (id: string) => [
        intakeQueryKeys.all,
        intakeQueryKeys.detail(id),
    ],
    onIntakeDelete: (id: string) => [
        intakeQueryKeys.all,
        intakeQueryKeys.detail(id),
    ],
    onIntakeStatusUpdate: (id: string) => [
        intakeQueryKeys.all,
        intakeQueryKeys.detail(id),
    ],
};

// List operations
export function useAdminIntakeList(params: IntakeQueryParams) {
    return useQuery({
        queryKey: intakeQueryKeys.list(params),
        queryFn: async () => {
            const result = await adminIntakeList(params);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            if (!result.data) {
                throw new Error('No data returned from adminIntakeList');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminIntakeSearch(search: string) {
    return useQuery({
        queryKey: intakeQueryKeys.list({ search }),
        queryFn: async () => {
            const result = await adminIntakeList({ search });
            if (!result.success) {
                throw new Error(result.error || 'Failed to search intakes');
            }
            if (!result.data) {
                throw new Error('No data returned from adminIntakeList');
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

// Detail operations
export function useAdminIntakeDetails(id: string) {
    return useQuery({
        queryKey: intakeQueryKeys.detail(id),
        queryFn: async () => {
            const result = await adminIntakeDetails(id);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch intake details'
                );
            }
            if (!result.data) {
                throw new Error('No data returned from adminIntakeDetails');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!id,
    });
}

// Mutation operations
export function useAdminIntakeCreate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: IntakeCreateData) => adminIntakeCreate(data),
        onSuccess: async () => {
            // Invalidate all intake queries
            await queryClient.invalidateQueries({
                queryKey: intakeQueryKeys.all,
            });
        },
    });
}

export function useAdminIntakeUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: IntakeUpdateData) => adminIntakeUpdate(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific intake queries
                await queryClient.invalidateQueries({
                    queryKey: intakeQueryKeys.detail(result.data.id),
                });
                await queryClient.invalidateQueries({
                    queryKey: intakeQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminIntakeUpsert() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: IntakeCreateData | IntakeUpdateData) =>
            adminIntakeUpsert(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate all intake queries
                await queryClient.invalidateQueries({
                    queryKey: intakeQueryKeys.all,
                });
                // If we have an ID in the result, invalidate the specific intake detail query
                if (result.data.id) {
                    await queryClient.invalidateQueries({
                        queryKey: intakeQueryKeys.detail(result.data.id),
                    });
                }
            }
        },
    });
}

export function useAdminIntakeDelete() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminIntakeDelete(id),
        onSuccess: async (result, variables) => {
            if (result.success) {
                // Invalidate specific intake queries
                await queryClient.invalidateQueries({
                    queryKey: intakeQueryKeys.detail(variables),
                });
                await queryClient.invalidateQueries({
                    queryKey: intakeQueryKeys.all,
                });
            }
        },
    });
}

export function useAdminIntakeConstraintCheck(id: string) {
    return useQuery({
        queryKey: [...intakeQueryKeys.all, 'constraint-check'],
        queryFn: async () => {
            const result = await adminIntakeCheckConstraints(id);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to check intake constraints'
                );
            }
            if (!result.data) {
                throw new Error(
                    'No data returned from adminIntakeCheckConstraints'
                );
            }
            return result.data;
        },
        enabled: !!id, // Only run when explicitly called
    });
}

// Status update operations
export function useAdminIntakeUpdateStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: IntakeStatusUpdate) => adminIntakeUpdateStatus(data),
        onSuccess: async result => {
            if (result.success && result.data) {
                // Invalidate specific intake queries
                await queryClient.invalidateQueries({
                    queryKey: intakeQueryKeys.detail(result.data.id),
                });
                await queryClient.invalidateQueries({
                    queryKey: intakeQueryKeys.all,
                });
            }
        },
    });
}

// Specialized operations
export function useAdminIntakeMetrics() {
    return useQuery({
        queryKey: intakeQueryKeys.metrics(),
        queryFn: async () => {
            // This would call a specialized server action for metrics
            // Implementation would depend on specific requirements
            return { success: true, data: { total: 0, active: 0 } };
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminIntakeExport() {
    // This would be a mutation hook for export functionality
    // Implementation would depend on specific requirements
    return useMutation({
        mutationFn: async (params: any) => {
            // Export implementation
            return { success: true, data: '' };
        },
    });
}

export const useGenerateIntakesForCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (courseId: string) =>
            adminIntakeGenerateForCourse(courseId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: intakeQueryKeys.all,
            });
        },
    });
};

export const useGenerateIntakesForCourseAdvanced = () => {
    const queryClient = useQueryClient();
    return useMutation<IntakeGenerationResult, Error, string>({
        mutationFn: (courseId: string) =>
            adminIntakeGenerateForCourseAdvanced(courseId),
        onSuccess: async result => {
            // Only invalidate queries if the operation was successful
            if (result.success) {
                await queryClient.invalidateQueries({
                    queryKey: intakeQueryKeys.all,
                });
                await queryClient.invalidateQueries({
                    queryKey: courseQueryKeys.all,
                });
            }
        },
        onError: error => {
            console.error('Failed to generate intakes:', error);
        },
    });
};

/**
 * Hook to fetch intakes for a specific course and year
 */
export const useAdminIntakesByCourseAndYear = (
    courseId: string | undefined,
    year?: string
) => {
    return useQuery<IntakesByCourseAndYearResponse>({
        queryKey: [
            'intakes-by-course-year',
            courseId,
            year || new Date().getFullYear().toString(),
        ],
        queryFn: async () => {
            const result = await adminIntakesByCourseAndYear(
                courseId,
                year || new Date().getFullYear().toString()
            );
            if (!result.success) {
                throw new Error(
                    result.error ||
                        'Failed to fetch intakes for course and year'
                );
            }
            // Ensure result.data is not undefined before returning
            if (!result.data) {
                throw new Error(
                    'No data returned from adminIntakesByCourseAndYear'
                );
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        enabled: !!courseId, // Only run the query if courseId is provided
    });
};

/**
 * Hook to fetch all active intakes
 */
export const useAdminIntakeListAllActive = () => {
    return useQuery({
        queryKey: intakeQueryKeys.active(),
        queryFn: async () => {
            const result = await adminIntakeListAllActive();
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch active intakes'
                );
            }
            if (!result.data) {
                throw new Error(
                    'No data returned from adminIntakeListAllActive'
                );
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
