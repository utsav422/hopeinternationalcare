'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomerContactRequestFromFormData } from '@/lib/server-actions/user/customer-contact-requests-optimized';
import { queryKeys } from '../../lib/query-keys';

export function usePublicCustomerContactRequestCreate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await createCustomerContactRequestFromFormData(formData);
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
