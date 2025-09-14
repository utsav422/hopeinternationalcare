'use client';

import {useMutation, useQueryClient, useSuspenseQuery,} from '@tanstack/react-query';
import {
    adminCustomerContactRequestDeleteById,
    adminCustomerContactRequestList,
    adminCustomerContactRequestUpdateStatusById,
} from '@/lib/server-actions/admin/customer-contact-requests';
import {queryKeys} from '../../lib/query-keys';
import type {ListParams as DataTableListParams} from "@/hooks/admin/use-data-table-query-state";

type ListParams = Partial<DataTableListParams>;

export function useAdminCustomerContactRequestList({
                                                       page = 1,
                                                       pageSize = 10,
                                                       sortBy,
                                                       order,
                                                       filters
                                                   }: ListParams) {
    return useSuspenseQuery({
        queryKey: queryKeys.customerContactRequests.list({
            page,
            pageSize,
            sortBy,
            order,
            filters
        }),
        queryFn: async () => {
            const result = await adminCustomerContactRequestList({
                page,
                pageSize,
                sortBy,
                order,
                filters
            });
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }
            return result;
        }, staleTime: 1000 * 60 * 5,  //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useAdminCustomerContactRequestUpdateStatusById() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, status}: { id: string; status: string }) =>
            adminCustomerContactRequestUpdateStatusById(id, status),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.customerContactRequests.all,
            });
        },
    });
}

export function useAdminCustomerContactRequestDeleteById() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => adminCustomerContactRequestDeleteById(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.customerContactRequests.all,
            });
        },
    });
}
