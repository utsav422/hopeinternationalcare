'use client';

import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import type { TypePaymentStatus } from '@/lib/db/schema/enums';
import { queryKeys } from '@/lib/query-keys';
import {
  adminDeletePayment,
  adminGetPaymentDetailsByEnrollmentId,
  adminGetPaymentDetailsWithOthersById,
  adminGetPaymentOnlyDetailsById,
  adminGetPayments,
  adminUpdatePaymentStatus,
  adminUpsertPayment,
} from '@/lib/server-actions/admin/payments';
import type { TablesInsert } from '@/utils/supabase/database.types';

export const useGetPayments = (params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TypePaymentStatus;
}) => {
  return useSuspenseQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: async () => {
      const result = await adminGetPayments(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });
};

export const useGetPaymentDetailsByEnrollmentId = (enrollmentId: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.payments.detailByEnrollment(enrollmentId),
    queryFn: async () => {
      const result = await adminGetPaymentDetailsByEnrollmentId(enrollmentId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetPaymentOnlyDetailsById = (paymentId: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.payments.detail(paymentId),
    queryFn: async () => {
      const result = await adminGetPaymentOnlyDetailsById(paymentId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetPaymentDetailsWithOthersById = (paymentId: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.payments.detail(paymentId),
    queryFn: async () => {
      const result = await adminGetPaymentDetailsWithOthersById(paymentId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useUpsertPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TablesInsert<'payments'>) => adminUpsertPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      remarks,
    }: {
      id: string;
      status: TypePaymentStatus;
      remarks?: string;
    }) => adminUpdatePaymentStatus(id, status, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeletePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
  });
};
