'use client';

import {useMutation, useQueryClient, useSuspenseQuery,} from '@tanstack/react-query';
import type {ZodInsertIntakeType} from '@/lib/db/drizzle-zod-schema/intakes';
import {queryKeys} from '@/lib/query-keys';
import {
    adminIntakeDeleteById,
    adminIntakeDetailsById,
    adminIntakeGenerateForCourse,
    adminIntakeGenerateForCourseAdvanced,
    adminIntakeList,
    adminIntakeListAll,
    adminIntakeListAllActive,
    adminIntakesByCourseAndYear,
    adminIntakeUpsert,
    type IntakeGenerationResult,
} from '@/lib/server-actions/admin/intakes';
import type {ListParams} from './use-data-table-query-state';

export const useAdminIntakeList = (params: ListParams) => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.list(params),
        queryFn: async () => {
            const result = await adminIntakeList(params);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminIntakeListAllActive = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.activeIntakes,
        queryFn: async () => {
            const result = await adminIntakeListAllActive();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch active intakes');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminIntakeListAll = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.all,
        queryFn: async () => {
            const result = await adminIntakeListAll();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch all intakes');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminIntakeDetailsById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.detail(id),
        queryFn: async () => {
            const result = await adminIntakeDetailsById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intake');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminIntakeUpsert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ZodInsertIntakeType) =>
            adminIntakeUpsert(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.intakes.all});
        },
    });
};

export const useAdminIntakeDelete = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminIntakeDeleteById(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.intakes.all});
        },
    });
};

export const useGenerateIntakesForCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (courseId: string) => adminIntakeGenerateForCourse(courseId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.intakes.all});
        },
    });
};

export const useGenerateIntakesForCourseAdvanced = () => {
    const queryClient = useQueryClient();
    return useMutation<IntakeGenerationResult, Error, string>({
        mutationFn: (courseId: string) =>
            adminIntakeGenerateForCourseAdvanced(courseId),
        onSuccess: async (result) => {
            // Only invalidate queries if the operation was successful
            if (result.success) {
                await queryClient.invalidateQueries({queryKey: queryKeys.intakes.all});
                await queryClient.invalidateQueries({queryKey: queryKeys.courses.all});
            }
        },
        onError: (error) => {
            console.error('Failed to generate intakes:', error);
        },
    });
};

/**
 * Hook to fetch intakes for a specific course and year
 */
export const useAdminIntakesByCourseAndYear = (courseId: string, year?: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.list({
            filters: [{course_id: courseId, year}]
        }),
        queryFn: () => adminIntakesByCourseAndYear(courseId, year),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        // Only run a query if both courseId and year are provided
        // enabled: Boolean(courseId && year),
    });
};
