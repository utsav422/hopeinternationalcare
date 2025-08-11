'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getActiveIntakesByCourseId,
  getAllIntakes,
  getIntakeById,
} from '@/server-actions/public/intakes';
import { queryKeys } from '../../lib/query-keys';

export function useGetActiveIntakesByCourseId(courseId: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(courseId),
    queryFn: () => getActiveIntakesByCourseId(courseId),
    enabled: !!courseId,
  });
}

export function useGetAllIntakes() {
  return useQuery({
    queryKey: queryKeys.intakes.all,
    queryFn: getAllIntakes,
  });
}

export function useGetIntakeById(id: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(id),
    queryFn: () => getIntakeById(id),
    enabled: !!id,
  });
}
