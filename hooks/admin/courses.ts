'use client';

import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import {
    adminCourseDeleteById,
    adminCourseDetailsById,
    adminCourseList,
    adminCourseListAll,
    adminCourseUpdateCategoryId,
    adminCourseUpsert,
} from '@/lib/server-actions/admin/courses';
import type { ZodInsertCourseType } from '@/lib/db/drizzle-zod-schema/courses';
import { queryKeys } from '../../lib/query-keys';

// Types
type ListParams = {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
};

// Course list hooks
export const useAdminCourses = (params: ListParams) => {
    return useQuery({
        queryKey: queryKeys.courses.list(params),
        queryFn: async () => adminCourseList(params),
        staleTime: 1000 * 60 * 5,  // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminCoursesAll = () => {
    return useQuery({
        queryKey: queryKeys.courses.lists(),
        queryFn: async () => await adminCourseListAll(),
        staleTime: 1000 * 60 * 5,  // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

// Course detail hooks
export const useAdminCourseById = (id: string) => {
    return useQuery({
        queryKey: queryKeys.courses.detail(id),
        queryFn: async () => adminCourseDetailsById(id),
        staleTime: 1000 * 60 * 5,  // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
        enabled: !!id,
    });
};

export const useSuspenseAdminCourseById = (id: string) => {
    return useSuspenseQuery({
        queryKey: queryKeys.courses.detail(id),
        queryFn: async () => adminCourseDetailsById(id),
        staleTime: 1000 * 60 * 5,  // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

// Course mutation hooks
export const useAdminCourseUpsert = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: FormData) => adminCourseUpsert(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.courses.all,
            });
        },
    });
};

export const useAdminCourseUpdateCategoryId = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: Partial<ZodInsertCourseType>) => adminCourseUpdateCategoryId(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.courses.all,
            });
        },
    });
};

export const useAdminCourseDelete = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => adminCourseDeleteById(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.courses.all,
            });
        },
    });
};
