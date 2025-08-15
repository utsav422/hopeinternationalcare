'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';

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
        queryKey: queryKeys.courses.list(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: params.page?.toString() || '1',
                pageSize: params.pageSize?.toString() || '10',
                sortBy: params.sortBy || 'created_at',
                sortOrder: params.sortOrder || 'desc',
                filters: JSON.stringify(params.filters || {}),
            });


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/courses?${searchParams}`
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
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour,
    });
}

export function useGetPublicCourseBySlug(slug?: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.courses.detail(slug || ''),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/courses?slug=${slug}`
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
        staleTime: 1000 * 60 * 30, // 30 minutes
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
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetRelatedCourses(courseId: string, categoryId: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.relatedCourses.detail(courseId, categoryId),
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                relatedTo: courseId,
                categoryId,
            });


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/courses?${searchParams}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch related courses');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch related courses');
            }
            return result;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}
