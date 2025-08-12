'use client';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import {
  adminDeleteCourse,
  adminGetAllCourses,
  adminGetCourseById,
  adminGetCourses,
  adminUpdateCourseCategoryIdCol,
  adminUpsertCourse,
} from '@/lib/server-actions/admin/courses';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { queryKeys } from '../../lib/query-keys';

type ListParams = Partial<DataTableListParams>;

export const useGetCourses = (params: ListParams) => {
  return useSuspenseQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: async () => {
      const result = await adminGetCourses(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetAllCourses = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.courses.lists(),
    queryFn: async () => {
      const result = await adminGetAllCourses();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetCourseById = (id: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: async () => {
      const result = await adminGetCourseById(id);
      if (!result.success) {
        throw new Error(result.error as string);
      }
      return result;
    },
  });
};

export const useUpsertCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => adminUpsertCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useUpdateCourseCategoryId = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<TablesInsert<'courses'>>) =>
      adminUpdateCourseCategoryIdCol(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};
