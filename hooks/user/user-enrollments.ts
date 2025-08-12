'use client';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createEnrollment } from '@/lib/server-actions/user/enrollments';
import { getUserEnrollments } from '@/lib/server-actions/user/enrollments-actions';
import { queryKeys } from '../../lib/query-keys';

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const result = await createEnrollment(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
    },
  });
};

export const useGetUserEnrollments = () => {
  return useSuspenseQuery({
    queryKey: [queryKeys.enrollments.all],
    queryFn: async () => {
      const result = await getUserEnrollments();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};
