import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import PaymentForm from '@/components/Admin/Payments/payment-form';
import { queryKeys } from '@/lib/query-keys';
import { adminUserList } from '@/lib/server-actions/admin/users';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function NewPaymentPage() {
    await requireAdmin();

    const queryClient = getQueryClient();

    // Prefetch empty payment data and users for new form
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.payments.detail(''),
            queryFn: () => Promise.resolve({ data: null, success: false, error: '' }),
            staleTime: 1000 * 60 * 5,  //5minutes
            gcTime: 1000 * 60 * 60, // 1 hour
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.users.list({ page: 1, pageSize: 100 }),
            queryFn: () => adminUserList(1, 100),
            staleTime: 1000 * 60 * 5,  //5minutes
            gcTime: 1000 * 60 * 60, // 1 hour
        })
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="flex h-full items-center justify-center space-y-4">
                <QueryErrorWrapper>
                    <Suspense>
                        <PaymentForm formTitle="Create New Payment Form" />
                    </Suspense>
                </QueryErrorWrapper>
            </div>
        </HydrationBoundary>
    );
}
