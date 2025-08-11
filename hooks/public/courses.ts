'use client';

import { useQuery } from '@tanstack/react-query';
import { getNewCourses, getRelatedCourses } from '@/server-actions/public/courses';
import { queryKeys } from '../../lib/query-keys';

export function useGetNewCourses() {
  return useQuery({
    queryKey: queryKeys.newCourses.all,
    queryFn: getNewCourses,
  });
}

export function useGetRelatedCourses(courseId: string, categoryId: string) {
  return useQuery({
    queryKey: queryKeys.relatedCourses.detail(courseId, categoryId),
    queryFn: () => getRelatedCourses(courseId, categoryId),
    enabled: !!(courseId && categoryId),
  });
}