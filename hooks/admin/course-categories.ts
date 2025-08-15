'use client';
import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { queryKeys } from '@/lib/query-keys';
import {
    adminDeleteCourseCategories,
    adminUpsertCourseCategories,
} from '@/lib/server-actions/admin/courses-categories';
import type { TablesInsert } from '@/utils/supabase/database.types';

type ListParams = Partial<DataTableListParams>;

export const useGetCourseCategories = (params: ListParams) => {
    return useSuspenseQuery({
        queryKey: queryKeys.courseCategories.list(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: params.page?.toString() || '1',
                pageSize: params.pageSize?.toString() || '10',
                sortBy: params.sortBy || 'created_at',
                order: params.order || 'desc',
                filters: JSON.stringify(params.filters || []),
            });

            const response = await fetch(
                `/api/admin/courses-categories?${searchParams}`
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

export const useGetAllCourseCategories = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.courseCategories.lists(),
        queryFn: async () => {

            const response = await fetch(
                `/api/admin/courses-categories?getAll=true`
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

export const useGetCourseCategoryById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.courseCategories.detail(id),
        queryFn: async () => {

            const response = await fetch(
                `/api/admin/courses-categories?id=${id}`
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

export const useUpsertCourseCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: TablesInsert<'course_categories'>) =>
            adminUpsertCourseCategories(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.courseCategories.all,
            });
        },
    });
};

export const useDeleteCourseCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminDeleteCourseCategories(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.courseCategories.all,
            });
        },
    });
};
