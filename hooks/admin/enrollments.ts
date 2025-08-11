'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { queryKeys } from '@/lib/query-keys';
import {
  adminDeleteEnrollment,
  adminGetAllEnrollments,
  adminGetEnrollmentById,
  adminGetEnrollments,
  adminUpdateEnrollmentStatus,
  adminUpsertEnrollment,
} from '@/server-actions/admin/enrollments';
import type { ZodEnrollmentInsertType } from '@/utils/db/drizzle-zod-schema/enrollment';
import type { TypeEnrollmentStatus } from '@/utils/db/schema/enums';

type EnrollmentListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
  filters?: ColumnFiltersState;
};
export const useAdminGetAllEnrollments = () => {
  return useQuery({
    queryKey: queryKeys.enrollments.all,
    queryFn: () => adminGetAllEnrollments(),
  });
};

export const useGetEnrollments = (params: EnrollmentListParams) => {
  return useQuery({
    queryKey: queryKeys.enrollments.list(params),
    queryFn: () => adminGetEnrollments(params),
  });
};

export const useGetEnrollmentById = (id: string) => {
  return useQuery({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: () => adminGetEnrollmentById(id),
    enabled: !!(id && id.length > 0),
  });
};

export const useUpsertEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: ZodEnrollmentInsertType }) =>
      adminUpsertEnrollment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
    },
  });
};

export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      cancelled_reason,
    }: {
      id: string;
      status: TypeEnrollmentStatus;
      cancelled_reason?: string;
    }) => adminUpdateEnrollmentStatus(id, status, cancelled_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
    },
  });
};

export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.all });
    },
  });
};
