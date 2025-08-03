'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEnrollment } from '@/server-actions/user/enrollments';
import type { enrollments } from '@/utils/db/schema/enrollments';
import { queryKeys } from './query-keys';

type EnrollmentFormInput = typeof enrollments.$inferInsert;

export const useCreateEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EnrollmentFormInput) => createEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
    },
  });
};