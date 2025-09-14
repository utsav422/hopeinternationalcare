'use server';
import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Suspense} from 'react';
import {queryKeys} from '@/lib/query-keys';
import {adminIntakeList} from '@/lib/server-actions/admin/intakes';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import IntakesTables from '../../../../components/Admin/Intakes/intakes-tables';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import {ZodAdminIntakeQuerySchema, ZodAdminIntakeQueryType} from '@/lib/db/drizzle-zod-schema';
import {normalizeProps} from "@/lib/normalizeProps";
import {redirect} from "next/navigation";
import {IdParamsSchema} from "@/lib/types/shared";

export default async function IntakesPage({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<{}>;
    searchParams: Promise<ZodAdminIntakeQueryType>
}) {
    // Await the promised params and searchParams
    const _params = await promisedParams;
    const searchParams = await promisedSearchParams;
    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminIntakeQuerySchema, _params, searchParams);

    const queryClient = getQueryClient();
    try {
        const {
            page,
            pageSize,
            sortBy,
            order,
            filters
        } = validatedSearchParams;
        await requireAdmin();

        const orderValue = (order === 'asc' || order === 'desc') ? order : 'desc';
        await queryClient.prefetchQuery({
            queryKey: queryKeys.intakes.list({
                page: Number(page),
                pageSize: Number(pageSize),
                sortBy,
                order: orderValue,
                filters: JSON.stringify(filters)
            }),
            queryFn: async () =>
                await adminIntakeList({
                    page: Number(page),
                    pageSize: Number(pageSize),
                    sortBy,
                    order: orderValue,
                    filters
                }),
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories')
    }


    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <IntakesTables/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}

