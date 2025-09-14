'use client';

import {useMutation, useQueryClient,} from '@tanstack/react-query';
import {createCustomerContactRequest} from '@/lib/server-actions/user/customer-contact-requests';
import {queryKeys} from '../../lib/query-keys';

export function usePublicCustomerContactRequestCreate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await createCustomerContactRequest(formData);
            if (!result.success || result?.error) {
                throw new Error(JSON.stringify(result?.error));
            }
            return result.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.customerContactRequests.all,
            });
        },
    });
}