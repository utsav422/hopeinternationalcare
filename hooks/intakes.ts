'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminDeleteIntake,
  adminGetIntakeById,
  adminGetIntakes,
  adminUpsertIntake,
} from '@/server-actions/admin/intakes';
import { getAllIntakes } from '@/server-actions/public/get-all-intakes';
import { getCourseIntakes } from '@/server-actions/public/intakes';
import { queryKeys } from './query-keys';

export function useGetCourseIntakes(courseId: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(courseId),
    queryFn: () => getCourseIntakes(courseId),
    enabled: !!courseId,
  });
}

export function useGetAllIntakes() {
  return useQuery({
    queryKey: queryKeys.intakes.all,
    queryFn: getAllIntakes,
  });
}

export function useGetIntakes(params: any) {
  return useQuery({
    queryKey: queryKeys.intakes.list(params),
    queryFn: () => adminGetIntakes(params),
  });
}

export function useGetIntakeById(id: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(id),
    queryFn: () => adminGetIntakeById(id),
    enabled: !!id,
  });
}

export function useUpsertIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminUpsertIntake(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
}

export function useDeleteIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteIntake(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
}
