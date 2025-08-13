'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export const useGetAllCourseCategories = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.courseCategories.lists(),
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/public/courses-categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      return result;
    },
  });
};
