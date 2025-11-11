import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CustomerContactRequestsTable from '@/components/Admin/CustomerContactRequests/customer-contact-requests-table';
import { queryKeys } from '@/lib/query-keys';
import { adminCustomerContactRequestList } from '@/lib/server-actions/admin/customer-contact-requests-optimized';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import {
    ZodContactRequestQuerySchema,
    ZodContactRequestQueryType,
} from '@/lib/db/drizzle-zod-schema';
import { normalizeProps } from '@/lib/normalizeProps';
import { redirect } from 'next/navigation';
import { IdParamsSchema } from '@/lib/types/shared';

export default async function CustomerContactRequestsPage({
    params: promisedParams,
    searchParams: promisedSearchParams,
}: {
    params: Promise<{}>;
    searchParams: Promise<ZodContactRequestQueryType>;
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;
    // Validate and normalize the props
    const { params: validatedParams, searchParams: validatedSearchParams } =
        await normalizeProps(
            IdParamsSchema,
            ZodContactRequestQuerySchema,
            params,
            searchParams
        );

    const { page, pageSize, sortBy, order, filters } = validatedSearchParams;

    const queryClient = getQueryClient();
    try {
        await requireAdmin();
        await queryClient.prefetchQuery({
            queryKey: queryKeys.customerContactRequests.list({
                page,
                pageSize,
            }),
            queryFn: async () =>
                await adminCustomerContactRequestList({
                    page: Number(page),
                    pageSize: Number(pageSize),
                    sortBy,
                    order,
                    filters,
                }),
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories');
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <CustomerContactRequestsTable />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
