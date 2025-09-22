'use client';

import { useQuery, useSuspenseQuery, useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    getCachedPublicCourseBySlug,
    getCachedPublicCourses,
    getCachedRelatedCourses,
    getCachedPublicCourseById,
    getCachedNewCourses
} from '@/lib/server-actions/public/courses-optimized';

type Filters = {
    title?: string;
    category?: string;
    duration?: number;
    intake_date?: string;
};

export const useGetPublicCourses = (params: {
    page?: number;
    pageSize?: number;
    filters?: Filters;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    return useInfiniteQuery({
        queryKey: queryKeys.publicCourses.list(params),
        queryFn: async ({ pageParam = 1 }) => {
            return await getCachedPublicCourses({ ...params, page: pageParam });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any, allPages: any[]) => {
            if (lastPage.data && lastPage.data.length < (params.pageSize || 10)) {
                return undefined;
            }
            return allPages.length + 1;
        },
        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour

    });
};

export function useGetPublicCourseById(courseId: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.courses.detail(courseId),
        queryFn: async () => {
            const result = await getCachedPublicCourseById(courseId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch course');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour,
    });
}

export function useGetPublicCourseBySlug(slug: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.publicCourses.detail(slug),
        queryFn: () => getCachedPublicCourseBySlug(slug),

        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetNewCourses() {
    return useSuspenseQuery({
        queryKey: queryKeys.newCourses.all,
        queryFn: async () => {
            const result = await getCachedNewCourses();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch new courses');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetRelatedCourses(courseId: string, categoryId: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.relatedCourses.detail(courseId, categoryId),
        queryFn: async () => await getCachedRelatedCourses(courseId, categoryId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}
