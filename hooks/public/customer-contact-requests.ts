'use client';

import {
    useMutation,
    useQueryClient,
    useSuspenseQuery,
} from '@tanstack/react-query';
import {
    adminCustomerContactRequestDeleteById,
    adminCustomerContactRequestUpdateStatusById,
} from '@/lib/server-actions/admin/customer-contact-requests';
import { createCustomerContactRequest } from '@/lib/server-actions/user/customer-contact-requests';
import { queryKeys } from '../../lib/query-keys';

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
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.customerContactRequests.all,
            });
        },
    });
}