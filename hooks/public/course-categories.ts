'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getCachedPublicAllCategories } from '@/lib/server-actions/public/course-categories';

export const useGetAllCourseCategories = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.courseCategories.all,
        queryFn: async () => {
            const result = await getCachedPublicAllCategories();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
