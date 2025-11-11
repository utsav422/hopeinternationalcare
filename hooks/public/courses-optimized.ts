'use client';

import {
    useQuery,
    useSuspenseQuery,
    useInfiniteQuery,
} from '@tanstack/react-query';
import {
    getPublicCourses,
    getPublicCourseById,
    getPublicCourseBySlug,
    getNewCourses,
    getRelatedCourses,
} from '@/lib/server-actions/public/courses-optimized';
import {
    PublicCourseQueryParams,
    PublicCourseListItem,
    PublicCourseDetail,
    RelatedCourse,
    NewCourse,
} from '@/lib/types/public/courses';

// Query key structure
const publicCourseQueryKeys = {
    all: ['public-courses'] as const,
    lists: () => [...publicCourseQueryKeys.all, 'list'] as const,
    list: (params: PublicCourseQueryParams) =>
        [...publicCourseQueryKeys.lists(), params] as const,
    details: () => [...publicCourseQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...publicCourseQueryKeys.details(), id] as const,
    bySlug: (slug: string) =>
        [...publicCourseQueryKeys.all, 'slug', slug] as const,
    new: () => [...publicCourseQueryKeys.all, 'new'] as const,
    related: (courseId: string, categoryId: string) =>
        [
            ...publicCourseQueryKeys.all,
            'related',
            courseId,
            categoryId,
        ] as const,
};

// List operations
export function useGetPublicCourses(params: PublicCourseQueryParams) {
    return useInfiniteQuery({
        queryKey: publicCourseQueryKeys.list(params),
        queryFn: async ({ pageParam = 1 }) => {
            return await getPublicCourses({ ...params, page: pageParam });
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage: any, allPages: any[]) => {
            if (
                lastPage.data &&
                lastPage.data.length < (params.pageSize || 10)
            ) {
                return undefined;
            }
            return allPages.length + 1;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

// Detail operations
export function useGetPublicCourseById(courseId: string) {
    return useSuspenseQuery({
        queryKey: publicCourseQueryKeys.detail(courseId),
        queryFn: async () => {
            const result = await getPublicCourseById(courseId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch course');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour,
    });
}

export function useGetPublicCourseBySlug(slug: string) {
    return useSuspenseQuery({
        queryKey: publicCourseQueryKeys.bySlug(slug),
        queryFn: async () => {
            const result = await getPublicCourseBySlug(slug);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch course');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

// Specialized operations
export function useGetNewCourses() {
    return useSuspenseQuery({
        queryKey: publicCourseQueryKeys.new(),
        queryFn: async () => {
            const result = await getNewCourses();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch new courses');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetRelatedCourses(courseId: string, categoryId: string) {
    return useSuspenseQuery({
        queryKey: publicCourseQueryKeys.related(courseId, categoryId),
        queryFn: async () => {
            const result = await getRelatedCourses(courseId, categoryId);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch related courses'
                );
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}
