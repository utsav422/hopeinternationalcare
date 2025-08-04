'use client';

import { useQuery } from '@tanstack/react-query';
import { getNewCourses } from '@/server-actions/public/new-courses';
import { queryKeys } from './query-keys';

export function useGetNewCourses() {
  return useQuery({
    queryKey: queryKeys.newCourses.all,
    queryFn: getNewCourses,
  });
}
