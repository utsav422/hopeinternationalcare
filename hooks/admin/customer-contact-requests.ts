'use client';

import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import {
    deleteCustomerContactRequest,
    updateCustomerContactRequestStatus,
} from '@/lib/server-actions/admin/customer-contact-requests';
import { createCustomerContactRequest } from '@/lib/server-actions/user/customer-contact-requests';
import { queryKeys } from '../../lib/query-keys';

export function useCreateCustomerContactRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await createCustomerContactRequest(formData);
            if (!result.success || result?.error) {
                throw new Error(JSON.stringify(result?.error));
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.customerContactRequests.all,
            });
        },
    });
}

export function useGetCustomerContactRequests({
    page = 1,
    pageSize = 10,
    search,
    status,
}: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
} = {}) {
    return useSuspenseQuery({
        queryKey: queryKeys.customerContactRequests.list({
            page,
            pageSize,
            search,
            status,
        }),
        queryFn: async () => {
            const searchParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
                ...(search && { search }),
                ...(status && { status }),
            });
            const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

            const response = await fetch(
                `/api/admin/customer-contact-requests?${searchParams}`
            );
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }
            return result;
        }, staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
}

export function useUpdateCustomerContactRequestStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateCustomerContactRequestStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.customerContactRequests.all,
            });
        },
    });
}

export function useDeleteCustomerContactRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCustomerContactRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.customerContactRequests.all,
            });
        },
    });
}
