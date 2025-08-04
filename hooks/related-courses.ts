'use client';

import { useQuery } from '@tanstack/react-query';
import { getRelatedCourses } from '@/server-actions/public/related-courses';
import { queryKeys } from './query-keys';

export function useGetRelatedCourses(courseId: string, categoryId: string) {
  return useQuery({
    queryKey: queryKeys.relatedCourses.detail(courseId, categoryId),
    queryFn: () => getRelatedCourses(courseId, categoryId),
    enabled: !!(courseId && categoryId),
  });
}
