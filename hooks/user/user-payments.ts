'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPayment,
  getUserPaymentHistory,
} from '@/server-actions/user/payments';
import type { payments as paymentsTable } from '@/utils/db/schema/payments';
import { queryKeys } from '../../lib/query-keys';

type PaymentInsert = typeof paymentsTable.$inferInsert;

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<PaymentInsert, 'id' | 'status'> & {
        enrollment_id: number;
      }
    ) => createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.userPaymentHistory.all,
      });
    },
  });
};

export const useGetUserPaymentHistory = () => {
  return useQuery({
    queryKey: queryKeys.userPaymentHistory.all,
    queryFn: () => getUserPaymentHistory(),
  });
};
