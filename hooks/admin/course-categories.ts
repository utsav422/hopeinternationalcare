'use client';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { queryKeys } from '@/lib/query-keys';
import {
  adminDeleteCourseCategories,
  adminGetAllCatogies,
  adminGetCourseCategoriesById,
  adminGetCoursesCategories,
  adminUpsertCourseCategories,
} from '@/lib/server-actions/admin/courses-categories';
import type { TablesInsert } from '@/utils/supabase/database.types';

type ListParams = Partial<DataTableListParams>;

export const useGetCourseCategories = (params: ListParams) => {
  return useSuspenseQuery({
    queryKey: queryKeys.courseCategories.list(params),
    queryFn: async () => {
      const result = await adminGetCoursesCategories(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetAllCourseCategories = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.courseCategories.lists(),
    queryFn: async () => {
      const result = await adminGetAllCatogies();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetCourseCategoryById = (id: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.courseCategories.detail(id),
    queryFn: async () => {
      const result = await adminGetCourseCategoriesById(id);
      if (!result.success) {
        throw new Error(result.error as string);
      }
      return result;
    },
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
