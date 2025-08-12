'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { adminGetAllCatogies } from '@/lib/server-actions/admin/courses-categories';

export const useGetAllCourseCategories = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.courseCategories.lists(),
    queryFn: adminGetAllCatogies,
  });
};
