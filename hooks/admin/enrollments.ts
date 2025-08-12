'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';
import type { TypeEnrollmentStatus } from '@/lib/db/schema/enums';
import { queryKeys } from '@/lib/query-keys';
import {
  adminDeleteEnrollment,
  adminGetAllEnrollments,
  adminGetAllEnrollmentsByStatus,
  adminGetEnrollmentById,
  adminGetEnrollments,
  adminGetEnrollmentsByUserId,
  adminGetEnrollmentWithDetails,
  adminGetEnrollmentWithPayment,
  adminUpdateEnrollmentStatus,
  adminUpsertEnrollment,
} from '@/lib/server-actions/admin/enrollments';

export const useGetEnrollments = (params: {
  page?: number;
  pageSize?: number;
  filters?: ColumnFiltersState;
}) => {
  return useSuspenseQuery({
    queryKey: queryKeys.enrollments.list(params),
    queryFn: async () => {
      const result = await adminGetEnrollments(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetEnrollmentById = (id: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: async () => {
      const result = await adminGetEnrollmentById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetEnrollmentWithDetails = (id: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.enrollments.detail(id),
    queryFn: async () => {
      const result = await adminGetEnrollmentWithDetails(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetEnrollmentsByUserId = (userId: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.enrollments.detailByUserId(userId),
    queryFn: async () => {
      const result = await adminGetEnrollmentsByUserId(userId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetEnrollmentWithPayment = (id: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.enrollments.detailByPaymentId(id),
    queryFn: async () => {
      const result = await adminGetEnrollmentWithPayment(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetAllEnrollments = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.enrollments.all,
    queryFn: async () => {
      const result = await adminGetAllEnrollments();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetAllEnrollmentsByStatus = (status: TypeEnrollmentStatus) => {
  return useSuspenseQuery({
    queryKey: queryKeys.enrollments.list({ status }),
    queryFn: async () => {
      const result = await adminGetAllEnrollmentsByStatus(status);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useUpsertEnrollment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ZodEnrollmentInsertType) => adminUpsertEnrollment(data),
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
