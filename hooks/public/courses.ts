'use client';

import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';

type Filters = {
  title?: string;
  category?: string;
  duration?: number;
  intake_date?: string;
};

export const useGetPublicCourses = (params: {
  page?: number;
  pageSize?: number;
  filters?: Filters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useSuspenseQuery({
    queryKey: queryKeys.courses.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: params.page?.toString() || '1',
        pageSize: params.pageSize?.toString() || '10',
        sortBy: params.sortBy || 'created_at',
        sortOrder: params.sortOrder || 'desc',
        filters: JSON.stringify(params.filters || {}),
      });

      const response = await fetch(`/api/public/courses?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }

      return result;
    },
  });
};

export function useGetPublicCourseById(courseId: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: async () => {
      const response = await fetch(`/api/public/courses?id=${courseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch course');
      }
      return result;
    },
    enabled: !!courseId,
  });
}

export function useGetPublicCourseBySlug(slug?: string) {
  return useQuery({
    queryKey: queryKeys.courses.detail(slug || ''),
    queryFn: async () => {
      const response = await fetch(`/api/public/courses?slug=${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch course');
      }
      return result;
    },
    enabled: !!slug,
  });
}

export function useGetNewCourses() {
  return useQuery({
    queryKey: queryKeys.newCourses.all,
    queryFn: async () => {
      const response = await fetch('/api/public/courses?new=true');
      if (!response.ok) {
        throw new Error('Failed to fetch new courses');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch new courses');
      }
      return result;
    },
  });
}

export function useGetRelatedCourses(courseId: string, categoryId: string) {
  return useQuery({
    queryKey: queryKeys.relatedCourses.detail(courseId, categoryId),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        relatedTo: courseId,
        categoryId,
      });
      const response = await fetch(`/api/public/courses?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch related courses');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch related courses');
      }
      return result;
    },
    enabled: !!(courseId && categoryId),
  });
}
