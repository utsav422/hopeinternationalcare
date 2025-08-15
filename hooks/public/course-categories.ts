'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export const useGetAllCourseCategories = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.courseCategories.all,
        queryFn: async () => {
            const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const response = await fetch(`/api/public/courses-categories`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            return result;
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
