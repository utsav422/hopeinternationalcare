'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';

export function useGetActiveIntakesByCourseId(courseId: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.detail(courseId),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/intakes?courseId=${courseId}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch intakes');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetAllIntakes() {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.all,
        queryFn: async () => {


            const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/public/intakes?all=true`);
            if (!response.ok) {
                throw new Error('Failed to fetch intakes');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetIntakeById(id: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.detail(id),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/intakes?intakeId=${id}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch intake');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intake');
            }
            return result;
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetUpcomingIntakes() {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.upCommingIntakes,
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/intakes?upcoming=true`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch upcoming intakes');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch upcoming intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useGetCourseIntakesBySlug(slug: string) {
    return useSuspenseQuery({
        queryKey: queryKeys.intakes.detail(slug),
        queryFn: async () => {


            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SITE_URL}/api/public/intakes?slug=${slug}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch intakes');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch intakes');
            }
            return result;
        },
        staleTime: 1000 * 60 * 15, // 15 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}
