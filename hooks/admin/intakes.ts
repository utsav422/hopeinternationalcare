'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { intakes as intakesTable } from '@/lib/db/schema/intakes';
import { queryKeys } from '@/lib/query-keys';
import {
  adminDeleteIntake,
  adminGetAllActiveIntake,
  adminGetAllIntake,
  adminGetIntakeById,
  adminGetIntakes,
  adminUpsertIntake,
  generateIntakesForCourse,
  generateIntakesForCourseAdvanced,
} from '@/lib/server-actions/admin/intakes';
import type { ListParams } from './use-data-table-query-state';

export const useGetIntakes = (params: ListParams) => {
  return useSuspenseQuery({
    queryKey: queryKeys.intakes.list(params),
    queryFn: async () => {
      const result = await adminGetIntakes(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetAllActiveIntake = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.intakes.activeIntakes,
    queryFn: async () => {
      const result = await adminGetAllActiveIntake();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetAllIntake = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.intakes.all,
    queryFn: async () => {
      const result = await adminGetAllIntake();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetIntakeById = (id: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.intakes.detail(id),
    queryFn: async () => {
      const result = await adminGetIntakeById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useUpsertIntake = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: typeof intakesTable.$inferInsert) =>
      adminUpsertIntake(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
};

export const useDeleteIntake = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteIntake(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
};

export const useGenerateIntakesForCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => generateIntakesForCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
};

export const useGenerateIntakesForCourseAdvanced = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) =>
      generateIntakesForCourseAdvanced(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intakes.all });
    },
  });
};
