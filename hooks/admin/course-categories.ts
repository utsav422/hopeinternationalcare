'use client';

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { queryKeys } from '@/lib/query-keys';
import {

    adminCourseCategoryDeleteById,
    adminCourseCategoryListAll,
    adminCourseCategoryList,
    adminCourseCategoryDetailsById,
    adminCourseCategoryUpsert
} from '@/lib/server-actions/admin/course-categories';
import { ZodInsertCourseCategoryType } from '@/lib/db/drizzle-zod-schema';

// Types
export type CourseCategoryQueryParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    filters?: ColumnFiltersState;
};

// Hooks for course categories
export const useAdminCourseCategoryList = (params: CourseCategoryQueryParams = {}) => {
    return useQuery({
        queryKey: queryKeys.courseCategories.list(params),
        queryFn: async () => adminCourseCategoryList(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminCourseCategoryDetailsById = (id: string) => {
    return useQuery({
        queryKey: queryKeys.courseCategories.detail(id),
        queryFn: async () => adminCourseCategoryDetailsById(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!id,
    });
};

export const useAdminCourseCategoryListAll = () => {
    return useQuery({
        queryKey: queryKeys.courseCategories.lists(),
        queryFn: async () => adminCourseCategoryListAll(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminCourseCategoryUpsert = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ZodInsertCourseCategoryType) => adminCourseCategoryUpsert(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.courseCategories.all,
            });
        },
    });
};

export const useAdminCourseCategoryDeleteById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminCourseCategoryDeleteById(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.courseCategories.all,
            });
        },
    });
};

export const useSuspenseAdminCourseCategoryDetailsById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.courseCategories.detail(id),
        queryFn: async () => adminCourseCategoryDetailsById(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};