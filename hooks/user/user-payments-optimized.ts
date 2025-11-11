'use client';

import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import {
    createPayment,
    getUserPaymentHistory,
} from '@/lib/server-actions/user/payments-optimized';
import {
    CreatePaymentData,
    UserPaymentHistory,
} from '@/lib/types/user/payments';

// Query key structure
const userPaymentQueryKeys = {
    all: ['user-payments'] as const,
    lists: () => [...userPaymentQueryKeys.all, 'list'] as const,
    list: (page: number, pageSize: number) =>
        [...userPaymentQueryKeys.lists(), page, pageSize] as const,
    details: () => [...userPaymentQueryKeys.all, 'detail'] as const,
    detail: (id: string) => [...userPaymentQueryKeys.details(), id] as const,
};

// Mutation operations
export const useCreatePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreatePaymentData) => {
            const result = await createPayment(data);
            if (!result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: userPaymentQueryKeys.all,
            });
        },
    });
};

// Query operations
export const useGetUserPaymentHistory = (
    page: number = 1,
    pageSize: number = 10,
    userId: string
) => {
    return useSuspenseQuery({
        queryKey: userPaymentQueryKeys.list(page, pageSize),
        queryFn: async () => {
            const result = await getUserPaymentHistory(page, pageSize, userId);
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch payment history'
                );
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
