'use client';
import {useMutation, useQueryClient, useSuspenseQuery} from '@tanstack/react-query';
import type {ZodInsertPaymentType} from '@/lib/db/drizzle-zod-schema/payments';
import {createPayment, getUserPaymentHistory} from '@/lib/server-actions/user/payments';
import {queryKeys} from '../../lib/query-keys';

type PaymentInsert = ZodInsertPaymentType;

export const useCreatePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (
            data: Omit<PaymentInsert, 'id' | 'status'> & {
                enrollment_id: string;
                userId: string
            }
        ) => {
            const result = await createPayment(data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.userPaymentHistory.all,
            });
        },
    });
};

export const useGetUserPaymentHistory = (page = 1, pageSize = 10, userId: string) => {
    return useSuspenseQuery({
        queryKey: [...queryKeys.userPaymentHistory.all, page, pageSize, userId],
        queryFn: async () => {
            const result = await getUserPaymentHistory(page, pageSize, userId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch payment history');
            }
            return result.data;
        }, staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
