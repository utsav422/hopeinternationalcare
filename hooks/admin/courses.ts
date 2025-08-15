'use client';
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import {
    adminDeleteCourse,
    adminUpdateCourseCategoryIdCol,
    adminUpsertCourse,
} from '@/lib/server-actions/admin/courses';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { queryKeys } from '../../lib/query-keys';

type ListParams = Partial<DataTableListParams>;

export const useGetCourses = (params: ListParams) => {
    return useSuspenseQuery({
        queryKey: queryKeys.courses.list(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: params.page?.toString() || '1',
                pageSize: params.pageSize?.toString() || '10',
                sortBy: params.sortBy || 'created_at',
                order: params.order || 'desc',
                filters: JSON.stringify(params.filters || []),
            });
            const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const response = await fetch(
                `/api/admin/courses?${searchParams}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            return result;
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetAllCourses = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.courses.lists(),
        queryFn: async () => {
            const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const response = await fetch(`/api/admin/courses?getAll=true`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            return result;
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetCourseById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.courses.detail(id),
        queryFn: async () => {
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

            const response = await fetch(`/api/admin/courses?id=${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            return result;
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useUpsertCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData) => adminUpsertCourse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
        },
    });
};

export const useUpdateCourseCategoryId = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<TablesInsert<'courses'>>) =>
            adminUpdateCourseCategoryIdCol(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
        },
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminDeleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
        },
    });
};
