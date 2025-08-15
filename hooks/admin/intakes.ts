'use client';

import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import type { intakes as intakesTable } from '@/lib/db/schema/intakes';
import { queryKeys } from '@/lib/query-keys';
import {
    adminDeleteIntake,
    adminUpsertIntake,
    generateIntakesForCourse,
    generateIntakesForCourseAdvanced,
} from '@/lib/server-actions/admin/intakes';
import type { ListParams } from './use-data-table-query-state';

export const useGetIntakes = (params: ListParams) => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.list(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: params.page?.toString() || '1',
                pageSize: params.pageSize?.toString() || '10',
                sortBy: params.sortBy || 'created_at',
                order: params.order || 'desc',
                filters: JSON.stringify(params.filters || []),
            });


            const response = await fetch(
                `/api/admin/intakes?${searchParams}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch intakes');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            return result;
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetAllActiveIntake = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.activeIntakes,
        queryFn: async () => {


            const response = await fetch(
                `/api/admin/intakes?getAllActive=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch active intakes');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch active intakes');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetAllIntake = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.all,
        queryFn: async () => {

            const response = await fetch(`/api/admin/intakes?getAll=true`);
            if (!response.ok) {
                throw new Error('Failed to fetch all intakes');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch all intakes');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetIntakeById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.detail(id),
        queryFn: async () => {


            const response = await fetch(`/api/admin/intakes?id=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch intake');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intake');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useUpsertIntake = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: typeof intakesTable.$inferInsert) =>
            adminUpsertIntake(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
        },
    });
};

export const useDeleteIntake = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminDeleteIntake(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
        },
    });
};

export const useGenerateIntakesForCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (courseId: string) => generateIntakesForCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
        },
    });
};

export const useGenerateIntakesForCourseAdvanced = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (courseId: string) =>
            generateIntakesForCourseAdvanced(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
        },
    });
};
