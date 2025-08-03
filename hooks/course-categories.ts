'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
  adminDeleteCourseCategories,
  adminGetAllCatogies,
  adminGetCourseCategoriesById,
  adminGetCoursesCategories,
  adminUpsertCourseCategories,
} from '@/server-actions/admin/courses-categories';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { queryKeys } from './query-keys';

type ListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
  filters?: ColumnFiltersState;
};

export const useGetAllCourseCategories = () => {
  return useQuery({
    queryKey: queryKeys.courseCategories.lists(),
    queryFn: () => adminGetAllCatogies(),
  });
};

export const useGetCourseCategories = (params: ListParams) => {
  return useQuery({
    queryKey: queryKeys.courseCategories.list(params),
    queryFn: () => adminGetCoursesCategories(params),
  });
};

export const useGetCourseCategoryById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.courseCategories.detail(id),
    queryFn: () => adminGetCourseCategoriesById(id),
    enabled: !!(id && id.length > 0),
  });
};

export const useUpsertCourseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TablesInsert<'course_categories'>) =>
      adminUpsertCourseCategories(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseCategories.all,
      });
    },
  });
};

export const useDeleteCourseCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteCourseCategories(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courseCategories.all,
      });
    },
  });
};
