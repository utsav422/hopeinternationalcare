'use client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getCachedPublicCourseById,
  getCachedPublicCourseBySlug,
  getCachedPublicCourses,
} from '@/lib/server-actions/public/courses';

import { queryKeys } from '../../lib/query-keys';

export const useGetPublicCourses = ({
  pageSize = 10,
  filters = {},
  sortBy = 'created_at',
  sortOrder = 'desc',
}: {
  pageSize?: number;
  filters?: object;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.publicCourses.list({ filters, sortBy, sortOrder }),
    queryFn: ({ pageParam = 1 }) =>
      getCachedPublicCourses({
        page: pageParam,
        pageSize,
        filters,
        sortBy,
        sortOrder,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data && lastPage.data.length < pageSize) {
        return;
      }
      return allPages.length + 1;
    },
    initialPageParam: 1,
  });
};

export const useGetPublicCourseById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.publicCourses.detail(id),
    queryFn: () => getCachedPublicCourseById(id),
    enabled: !!(id && id.length > 0),
  });
};

export const useGetPublicCourseBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.publicCourses.detail(slug),
    queryFn: () => getCachedPublicCourseBySlug(slug),
    enabled: !!(slug && slug.length > 0),
  });
};
