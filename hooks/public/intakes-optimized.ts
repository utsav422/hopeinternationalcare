'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import {
    getActiveIntakesByCourseId,
    getIntakeById,
    getUpcomingIntakes,
    getAllIntakes,
    getCourseIntakesBySlug,
} from '@/lib/server-actions/public/intakes-optimized';
import {
    ActiveIntake,
    PublicIntakeDetail,
    UpcomingIntake,
    CourseIntakeBySlug,
} from '@/lib/types/public/intakes';

// Query key structure
const publicIntakeQueryKeys = {
    all: ['public-intakes'] as const,
    lists: () => [...publicIntakeQueryKeys.all, 'list'] as const,
    list: () => [...publicIntakeQueryKeys.lists()] as const,
    details: () => [...publicIntakeQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...publicIntakeQueryKeys.details(), id] as const,
    byCourse: (courseId: string) =>
        [...publicIntakeQueryKeys.all, 'course', courseId] as const,
    bySlug: (slug: string) =>
        [...publicIntakeQueryKeys.all, 'slug', slug] as const,
    upcoming: () => [...publicIntakeQueryKeys.all, 'upcoming'] as const,
};

// List operations
export function useGetAllIntakes() {
    return useSuspenseQuery({
        queryKey: publicIntakeQueryKeys.list(),
        queryFn: async () => {
            const result = await getAllIntakes();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch all intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetUpcomingIntakes() {
    return useSuspenseQuery({
        queryKey: publicIntakeQueryKeys.upcoming(),
        queryFn: async () => {
            const result = await getUpcomingIntakes();
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch upcoming intakes'
                );
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

// Detail operations
export function useGetIntakeById(intakeId: string) {
    return useSuspenseQuery({
        queryKey: publicIntakeQueryKeys.detail(intakeId),
        queryFn: async () => {
            const result = await getIntakeById(intakeId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intake');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

// Specialized operations
export function useGetActiveIntakesByCourseId(courseId: string) {
    return useSuspenseQuery({
        queryKey: publicIntakeQueryKeys.byCourse(courseId),
        queryFn: async () => {
            const result = await getActiveIntakesByCourseId(courseId);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch active intakes'
                );
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetCourseIntakesBySlug(slug: string) {
    return useSuspenseQuery({
        queryKey: publicIntakeQueryKeys.bySlug(slug),
        queryFn: async () => {
            const result = await getCourseIntakesBySlug(slug);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch course intakes'
                );
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}
