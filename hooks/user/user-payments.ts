'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ZodInsertPaymentType } from '@/lib/db/drizzle-zod-schema/payments';
import { createPayment } from '@/lib/server-actions/user/payments';
import { queryKeys } from '../../lib/query-keys';

type PaymentInsert = ZodInsertPaymentType;

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Omit<PaymentInsert, 'id' | 'status'> & {
        enrollment_id: string;
      }
    ) => {
      const result = await createPayment(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userPaymentHistory.all,
      });
    },
  });
};

export const useGetUserPaymentHistory = (page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: [...queryKeys.userPaymentHistory.all, page, pageSize],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      const response = await fetch(`/api/user/payments?${searchParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment history');
      }
      return result.data;
    },
  });
};
