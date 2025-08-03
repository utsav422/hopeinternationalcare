'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import {
  adminDeleteEnrollment,
  adminGetAllEnrollments,
  adminGetAllEnrollmentsByStatus,
  adminGetEnrollmentById,
  adminGetEnrollments,
  adminUpdateEnrollmentStatus,
  adminUpsertEnrollment,
} from '@/server-actions/admin/enrollments';
import type { ZodInsertEnrollmentType } from '@/utils/db/drizzle-zod-schema/enrollment';
import type { TypeEnrollmentStatus } from '@/utils/db/schema/enums';
import { queryKeys } from './query-keys';

type EnrollmentListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
  filters?: ColumnFiltersState;
};

export const useGetAllEnrollments = () => {
  return useQuery({
    queryKey: queryKeys.enrollments.lists(),
    queryFn: () => adminGetAllEnrollments(),
  });
};

export const useGetEnrollments = (params: EnrollmentListParams) => {
  return useQuery({
    queryKey: queryKeys.enrollments.list(params),
    queryFn: () => adminGetEnrollments(params),
  });
};

export const useGetAllEnrollmentsByStatus = (status: TypeEnrollmentStatus) => {
  return useQuery({
    queryKey: queryKeys.enrollments.list({ status }),
    queryFn: () => adminGetAllEnrollmentsByStatus(status),
    enabled: !!(status && status?.length > 0),
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
    mutationFn: (data: ZodInsertEnrollmentType) => adminUpsertEnrollment(data),
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
