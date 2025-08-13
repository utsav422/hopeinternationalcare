'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import PaymentsTables from '@/components/Admin/Payments/payments-tables';
import type { TypePaymentStatus } from '@/lib/db/schema/enums';
import { queryKeys } from '@/lib/query-keys';
import { getCachedAdminPayments } from '@/lib/server-actions/admin/payments';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function (props: {
    params: Params;
    searchParams: SearchParams;
}) {
    await requireAdmin();
    const searchParams = await props.searchParams;
    const page =
        typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
    const pageSize =
        typeof searchParams.pageSize === 'string'
            ? Number(searchParams.pageSize)
            : 10;
    const search =
        typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const status =
        typeof searchParams.status === 'string' ? searchParams.status : undefined;

    const queryClient = getQueryClient();
    queryClient.prefetchQuery({
        queryKey: queryKeys.payments.list({
            page,
            pageSize,
            search,
            status: status as TypePaymentStatus | undefined,
        }),
        queryFn: async () =>
            await getCachedAdminPayments({
                page,
                pageSize,
                search,
                status: status as TypePaymentStatus | undefined,
            }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <PaymentsTables />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
