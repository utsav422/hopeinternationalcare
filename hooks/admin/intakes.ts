'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListParams } from '@/server-actions/admin/intakes';
import {
  adminDeleteIntake,
  adminGetAllActiveIntake,
  adminGetAllIntake,
  adminGetIntakeById,
  adminGetIntakes,
  adminUpsertIntake,
} from '@/server-actions/admin/intakes';
import { getActiveIntakesByCourseId } from '@/server-actions/public/intakes';
import type { intakes as intakesTable } from '@/utils/db/schema/intakes';
import { queryKeys } from '../../lib/query-keys';

export function useGetCourseIntakes(courseId: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(courseId),
    queryFn: () => getActiveIntakesByCourseId(courseId),
    enabled: !!courseId,
  });
}

export function useGetAllIntakes() {
  return useQuery({
    queryKey: queryKeys.intakes.all,
    queryFn: adminGetAllIntake,
  });
}

export function useGetIntakes(params: ListParams) {
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
export function useGetAllActiveIntake() {
  return useQuery({
    queryKey: queryKeys.intakes.activeIntakes,
    queryFn: () => adminGetAllActiveIntake(),
  });
}
export function useUpsertIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: typeof intakesTable.$inferInsert) =>
      adminUpsertIntake(data),
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
