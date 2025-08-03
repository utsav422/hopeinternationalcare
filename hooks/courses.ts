'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
  adminDeleteCourse,
  adminGetAllCourses,
  adminGetCourseById,
  adminGetCourses,
  adminUpdateCourseCategoryIdCol,
  adminUpsertCourse,
} from '@/server-actions/admin/courses';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { queryKeys } from './query-keys';

type ListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
  filters?: ColumnFiltersState;
};

export const useGetCourses = (params: ListParams) => {
  return useQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: () => adminGetCourses(params),
  });
};

export const useGetAllCourses = () => {
  return useQuery({
    queryKey: queryKeys.courses.lists(),
    queryFn: () => adminGetAllCourses(),
  });
};

export const useGetCourseById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.courses.detail(id),
    queryFn: () => adminGetCourseById(id),
    enabled: !!(id && id.length > 0),
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
