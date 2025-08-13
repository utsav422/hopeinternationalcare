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
      const searchParams = new URLSearchParams({
        page: params.page?.toString() || '1',
        pageSize: params.pageSize?.toString() || '10',
        search: params.search || '',
        ...(params.status && { status: params.status }),
      });
      const response = await fetch(`/api/admin/payments?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payments');
      }
      return result;
    },
  });
};

export const useGetPaymentDetailsByEnrollmentId = (enrollmentId: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.payments.detailByEnrollment(enrollmentId),
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/payments?enrollmentId=${enrollmentId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment details');
      }
      return result.data;
    },
  });
};

export const useGetPaymentOnlyDetailsById = (paymentId: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.payments.detail(paymentId),
    queryFn: async () => {
      const response = await fetch(`/api/admin/payments?id=${paymentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment details');
      }
      return result.data;
    },
  });
};

export const useGetPaymentDetailsWithOthersById = (paymentId: string) => {
  return useSuspenseQuery({
    queryKey: queryKeys.payments.detail(paymentId),
    queryFn: async () => {
      const response = await fetch(
        `/api/admin/payments?id=${paymentId}&withOthers=true`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment details');
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
