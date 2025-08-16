'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';
import { getPublicCourseBySlug, getPublicCourses, getRelatedCourses } from '@/lib/server-actions/public/courses';

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
    return useSuspenseQuery({
        queryKey: queryKeys.publicCourses.list(params),
        queryFn: async () => await getPublicCourses(params),
        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour

    });
};

export function useGetPublicCourseById(courseId: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.courses.detail(courseId),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/courses?id=${courseId}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch course');
            }
            const result = await response.json();
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
        queryFn: () => getPublicCourseBySlug(slug),

        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetNewCourses() {
    return useSuspenseQuery({
        queryKey: queryKeys.newCourses.all,
        queryFn: async () => {


            const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/public/courses?new=true`);
            if (!response.ok) {
                throw new Error('Failed to fetch new courses');
            }
            const result = await response.json();
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
        queryFn: async () => await getRelatedCourses(courseId, categoryId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}
