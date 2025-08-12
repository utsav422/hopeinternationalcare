'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ZodInsertPaymentType } from '@/lib/db/drizzle-zod-schema/payments';
import {
  createPayment,
  getUserPaymentHistory,
} from '@/lib/server-actions/user/payments';
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
      const result = await getUserPaymentHistory(page, pageSize);
      if (!result.success) {
        throw new Error(result.error as string);
      }
      return result.data;
    },
  });
};
