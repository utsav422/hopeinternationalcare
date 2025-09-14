import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Suspense} from 'react';
import RefundsTable from '@/components/Admin/Refunds/refunds-table';
import {queryKeys} from '@/lib/query-keys';
import {adminRefundList} from '@/lib/server-actions/admin/refunds';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import {ZodAdminCourseCategoryQuerySchema, ZodAdminRefundQueryType} from '@/lib/db/drizzle-zod-schema';
import {normalizeProps} from "@/lib/normalizeProps";
import {redirect} from "next/navigation";
import {IdParams, IdParamsSchema} from "@/lib/types/shared";

export default async function RefundsPage({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<IdParams>
    searchParams: Promise<ZodAdminRefundQueryType>
}) {
    // Await the promised params and searchParams
    const _params = await promisedParams;
    const searchParams = await promisedSearchParams;
    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminCourseCategoryQuerySchema, _params, searchParams);

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
            queryKey: queryKeys.refunds.list({
                page,
                pageSize,
                sortBy,
                order,
                filters,
            }),
            queryFn: async () =>
                await adminRefundList({
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
                    <RefundsTable/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}

