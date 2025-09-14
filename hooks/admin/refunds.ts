'use client';

import {useMutation, useQueryClient, useSuspenseQuery,} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {adminRefundList, adminRefundUpsert} from '@/lib/server-actions/admin/refunds';
import {ZodAdminRefundQueryType, ZodInsertRefundType} from '@/lib/db/drizzle-zod-schema/refunds';

export const useAdminRefundList = ({
                                       page,
                                       pageSize,
                                       sortBy,
                                       order,
                                       filters,

                                   }: ZodAdminRefundQueryType) => {
    return useSuspenseQuery({
        queryKey: queryKeys.refunds.list({
            page: Number(page),
            pageSize: Number(pageSize),
            sortBy,
            order,
            filters,
        }),
        queryFn: async () => {
            const result = await adminRefundList({
                page: Number(page),
                pageSize: Number(pageSize),
                sortBy,
                order,
                filters,
            });
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch refunds');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminRefundUpsert = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ZodInsertRefundType) => adminRefundUpsert(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: queryKeys.refunds.all});
        },
    });
};
