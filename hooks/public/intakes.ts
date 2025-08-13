'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/query-keys';

export function useGetActiveIntakesByCourseId(courseId: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(courseId),
    queryFn: async () => {
      const response = await fetch(`/api/public/intakes?courseId=${courseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch intakes');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch intakes');
      }
      return result;
    },
    enabled: !!courseId,
  });
}

export function useGetAllIntakes() {
  return useQuery({
    queryKey: queryKeys.intakes.all,
    queryFn: async () => {
      const response = await fetch('/api/public/intakes?all=true');
      if (!response.ok) {
        throw new Error('Failed to fetch intakes');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch intakes');
      }
      return result;
    },
  });
}

export function useGetIntakeById(id: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/public/intakes?intakeId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch intake');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch intake');
      }
      return result;
    },
    enabled: !!id,
  });
}

export function useGetUpcomingIntakes() {
  return useQuery({
    queryKey: queryKeys.intakes.upCommingIntakes,
    queryFn: async () => {
      const response = await fetch('/api/public/intakes?upcoming=true');
      if (!response.ok) {
        throw new Error('Failed to fetch upcoming intakes');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch upcoming intakes');
      }
      return result;
    },
  });
}

export function useGetCourseIntakesBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.intakes.detail(slug),
    queryFn: async () => {
      const response = await fetch(`/api/public/intakes?slug=${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch intakes');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch intakes');
      }
      return result;
    },
    enabled: !!slug,
  });
}
