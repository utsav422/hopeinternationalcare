'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';
import {
    getCachedCourseActiveIntakes,
    getCachedAllIntakes,
    getCachedUpcomingIntakes,
    getCachedCourseIntakesBySlug,
    getCachedIntakeById
} from '@/lib/server-actions/public/intakes';

export function useGetActiveIntakesByCourseId(courseId: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.list({
            filters: [{ course_id: courseId }],
        }),
        queryFn: async () => await getCachedCourseActiveIntakes(courseId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    },

    );
}
export function useAdminIntakeListAll() {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.all,
        queryFn: async () => {
            const result = await getCachedAllIntakes();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminIntakeDetailsById(id: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.detail(id),
        queryFn: async () => {
            const result = await getCachedIntakeById(id);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intake');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetUpcomingIntakes() {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.upCommingIntakes,
        queryFn: async () => {
            const result = await getCachedUpcomingIntakes();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch upcoming intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetCourseIntakesBySlug(slug: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.detail(slug),
        queryFn: async () => {
            const result = await getCachedCourseIntakesBySlug(slug);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}
