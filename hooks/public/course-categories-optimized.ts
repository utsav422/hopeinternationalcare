'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { 
  publicGetAllCategories
} from '@/lib/server-actions/public/course-categories-optimized';
import { 
  PublicCourseCategoryListItem
} from '@/lib/types/public/course-categories';

// Query key structure
const publicCourseCategoryQueryKeys = {
  all: ['public-course-categories'] as const,
  lists: () => [...publicCourseCategoryQueryKeys.all, 'list'] as const,
  list: () => [...publicCourseCategoryQueryKeys.lists()] as const,
};

// List operations
export function useGetPublicCourseCategories() {
  return useSuspenseQuery({
    queryKey: publicCourseCategoryQueryKeys.list(),
    queryFn: async () => {
      const result = await publicGetAllCategories();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch course categories');
      }
      return result;
    },
    staleTime: 1000 * 60 * 5,  // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}