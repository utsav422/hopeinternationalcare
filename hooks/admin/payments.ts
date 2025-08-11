'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminDeletePayment,
  adminGetPaymentDetailsByEnrollmentId,
  adminGetPaymentDetailsWithOthersById,
  adminGetPaymentOnlyDetailsById,
  adminGetPayments,
  adminUpdatePaymentStatus,
  adminUpsertPayment,
} from '@/server-actions/admin/payments';
import type { TypePaymentStatus } from '@/utils/db/schema/enums';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { queryKeys } from '../../lib/query-keys';

type PaymentListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TypePaymentStatus;
};

export const useGetPayments = (params: PaymentListParams) => {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => adminGetPayments(params),
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
      status: 'pending' | 'completed' | 'failed' | 'refunded';
      remarks?: string;
    }) => adminUpdatePaymentStatus(id, status, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
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

export const useGetPaymentDetailsByEnrollmentId = (enrollmentId: string) => {
  return useQuery({
    queryKey: queryKeys.payments.detail(enrollmentId),
    queryFn: () => adminGetPaymentDetailsByEnrollmentId(enrollmentId),
    enabled: !!(enrollmentId && enrollmentId?.length > 0),
  });
};

export const useGetPaymentOnlyDetailsById = (paymentId: string) => {
  return useQuery({
    queryKey: queryKeys.payments.detail(paymentId),
    queryFn: () => adminGetPaymentOnlyDetailsById(paymentId),
    enabled: !!(paymentId && paymentId?.length > 0),
  });
};

export const useGetPaymentDetailsWithOthersById = (paymentId: string) => {
  return useQuery({
    queryKey: queryKeys.payments.detail(paymentId),
    queryFn: () => adminGetPaymentDetailsWithOthersById(paymentId),
    enabled: !!(paymentId && paymentId?.length > 0),
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
