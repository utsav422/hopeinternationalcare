'use client';

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { 
  createEnrollment,
  getUserEnrollments
} from '@/lib/server-actions/user/enrollments-optimized';
import { 
  CreateEnrollmentData,
  UserEnrollmentListItem
} from '@/lib/types/user/enrollments';

// Query key structure
const userEnrollmentQueryKeys = {
  all: ['user-enrollments'] as const,
  lists: () => [...userEnrollmentQueryKeys.all, 'list'] as const,
  list: () => [...userEnrollmentQueryKeys.lists()] as const,
  details: () => [...userEnrollmentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userEnrollmentQueryKeys.details(), id] as const,
};

// Mutation operations
export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateEnrollmentData) => {
      const result = await createEnrollment(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userEnrollmentQueryKeys.all });
    },
  });
};

// Query operations
export const useGetUserEnrollments = () => {
  return useSuspenseQuery({
    queryKey: userEnrollmentQueryKeys.list(),
    queryFn: async () => {
      const result = await getUserEnrollments();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch enrollments');
      }
      return result.data;
    }, 
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};