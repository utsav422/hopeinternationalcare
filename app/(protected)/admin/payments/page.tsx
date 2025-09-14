'use server';
import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Suspense} from 'react';
import PaymentsTables from '@/components/Admin/Payments/payments-tables';
import {queryKeys} from '@/lib/query-keys';
import {cachedAdminPaymentList} from '@/lib/server-actions/admin/payments';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import {ZodAdminPaymentQuerySchema, ZodAdminPaymentQueryType} from '@/lib/db/drizzle-zod-schema';
import {normalizeProps} from "@/lib/normalizeProps";
import {redirect} from "next/navigation";
import {IdParamsSchema} from "@/lib/types/shared";

export default async function PaymentsPage({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<{}>;
    searchParams: Promise<ZodAdminPaymentQueryType>
}) {
// Await the promised params and searchParams
    const _params = await promisedParams;
    const searchParams = await promisedSearchParams;
    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminPaymentQuerySchema, _params, searchParams);

    const queryClient = getQueryClient();
    try {
        await requireAdmin();
        const {
            page,
            pageSize,
            sortBy,
            order,
            filters,
        } = validatedSearchParams;

        await queryClient.prefetchQuery({
            queryKey: queryKeys.payments.list({
                page,
                pageSize,
                sortBy,
                order,
                filters,
            }),
            queryFn: async () =>
                await cachedAdminPaymentList({
                    page: Number(page),
                    pageSize: Number(pageSize),
                    sortBy,
                    order,
                    filters,
                }),
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories')
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <PaymentsTables/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}

