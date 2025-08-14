'use client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
    getCachedPublicCourseById,
    getCachedPublicCourseBySlug,
    getPublicCourses,
} from '@/lib/server-actions/public/courses';

import { queryKeys } from '../../lib/query-keys';

export const useGetPublicCourses = ({
    pageSize = 10,
    filters = {},
    sortBy = 'created_at',
    sortOrder = 'desc',
}: {
    pageSize?: number;
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    // Create a stable query key by sorting the filter keys
    const stableFilters = filters ? Object.keys(filters).sort().reduce((acc, key) => {
        if (filters[key] !== '') {
            acc[key] = filters[key];
        }
        return acc;
    }, {} as Record<string, any>) : {};
    
    return useInfiniteQuery({
        queryKey: queryKeys.publicCourses.list({ 
            pageSize, 
            filters: stableFilters, 
            sortBy, 
            sortOrder 
        }),
        queryFn: async ({ pageParam = 1 }) => {
            const result = await getPublicCourses({
                page: pageParam,
                pageSize,
                filters,
                sortBy,
                sortOrder,
            });
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch courses');
            }
            
            return result;
        },
        getNextPageParam: (lastPage, allPages) => {
            // Check if we have data and if it's a full page
            if (lastPage.data && lastPage.data.length < pageSize) {
                return undefined; // No more pages
            }
            
            // If we have data, there might be more pages
            if (lastPage.data && lastPage.data.length > 0) {
                return allPages.length + 1;
            }
            
            return undefined; // No more pages
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
};

export const useGetPublicCourseById = (id: string) => {
    return useQuery({
        queryKey: queryKeys.publicCourses.detail(id),
        queryFn: async () => {
            const result = await getCachedPublicCourseById(id);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch course');
            }
            
            return result.data;
        },
        enabled: !!(id && id.length > 0),
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useGetPublicCourseBySlug = (slug: string) => {
    return useQuery({
        queryKey: queryKeys.publicCourses.detail(slug),
        queryFn: async () => {
            const result = await getCachedPublicCourseBySlug(slug);
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch course');
            }
            
            return result.data;
        },
        enabled: !!(slug && slug.length > 0),
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
