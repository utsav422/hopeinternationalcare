'use server';

import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Suspense} from 'react';
import CategoriesTable from '@/components/Admin/categories/categories-table';
import {queryKeys} from '@/lib/query-keys';
import {adminCourseCategoryList} from '@/lib/server-actions/admin/course-categories';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import {ZodAdminCourseCategoryQuerySchema, ZodAdminCourseCategoryQueryType} from '@/lib/db/drizzle-zod-schema';
import {normalizeProps} from "@/lib/normalizeProps";
import {redirect} from "next/navigation";
import {IdParams, IdParamsSchema} from "@/lib/types/shared";

export default async function CategoriesPage({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<IdParams>
    searchParams: Promise<ZodAdminCourseCategoryQueryType>
}) {
    // Await the promised params and searchParams
    const _params = await promisedParams;
    const searchParams = await promisedSearchParams;
    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminCourseCategoryQuerySchema, _params, searchParams);
    console.log({validatedParams, validatedSearchParams})

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
        const pageNum = Number(page) || 1;
        const pageSizeNum = Number(pageSize) || 10;
        const orderValue = (order === 'asc' || order === 'desc') ? order : 'desc';

        await queryClient.prefetchQuery({
            queryKey: queryKeys.courseCategories.list({
                page: pageNum,
                pageSize: pageSizeNum,
                sortBy: sortBy ?? 'created_at',
                order: orderValue,
                filters
            }),
            queryFn: async () =>
                await adminCourseCategoryList({
                    page: pageNum,
                    pageSize: pageSizeNum,
                    sortBy: sortBy ?? 'created_at',
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
                    <CategoriesTable/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}

