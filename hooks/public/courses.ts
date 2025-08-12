'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCachedNewCourses,
  getCachedRelatedCourses,
} from '@/lib/server-actions/public/courses';
import { queryKeys } from '../../lib/query-keys';

export function useGetNewCourses() {
  return useQuery({
    queryKey: queryKeys.newCourses.all,
    queryFn: getCachedNewCourses,
  });
}

export function useGetRelatedCourses(courseId: string, categoryId: string) {
  return useQuery({
    queryKey: queryKeys.relatedCourses.detail(courseId, categoryId),
    queryFn: () => getCachedRelatedCourses(courseId, categoryId),
    enabled: !!(courseId && categoryId),
  });
}
