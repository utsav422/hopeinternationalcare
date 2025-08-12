'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCachedAllIntakes,
  getCachedCourseActiveIntakes,
  getCachedIntakeById,
} from '@/lib/server-actions/public/intakes';
import { queryKeys } from '../../lib/query-keys';

export function useGetActiveIntakesByCourseId(courseId: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(courseId),
    queryFn: () => getCachedCourseActiveIntakes(courseId),
    enabled: !!courseId,
  });
}

export function useGetAllIntakes() {
  return useQuery({
    queryKey: queryKeys.intakes.all,
    queryFn: getCachedAllIntakes,
  });
}

export function useGetIntakeById(id: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(id),
    queryFn: () => getCachedIntakeById(id),
    enabled: !!id,
  });
}
