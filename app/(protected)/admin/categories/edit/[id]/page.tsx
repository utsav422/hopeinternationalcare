import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CategoryForm from '@/components/Admin/categories/category-form';
import { queryKeys } from '@/lib/query-keys';
import { adminCourseCategoryDetails } from '@/lib/server-actions/admin/course-categories-optimized';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

import { notFound, redirect } from 'next/navigation';
import { normalizeProps } from '@/lib/normalizeProps';
import {
    ZodAdminCourseCategoryQuerySchema,
    ZodAdminCourseCategoryQueryType,
} from '@/lib/db/drizzle-zod-schema';

import { IdParams, IdParamsSchema } from '@/lib/types/shared';

export default async function EditCategoryPage({
    params: promisedParams,
    searchParams: promisedSearchParams,
}: {
    params: Promise<IdParams>;
    searchParams: Promise<ZodAdminCourseCategoryQueryType>;
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const { params: validatedParams, searchParams: validatedSearchParams } =
        await normalizeProps(
            IdParamsSchema,
            ZodAdminCourseCategoryQuerySchema,
            params,
            searchParams
        );
    if (!validatedParams.id) {
        notFound();
    }
    const queryClient = getQueryClient();
    try {
        await requireAdmin();
        const response = await adminCourseCategoryDetails(validatedParams.id);
        if (!response.success) {
            notFound();
        }
        await queryClient.prefetchQuery({
            queryKey: queryKeys.courseCategories.detail(validatedParams.id),
            queryFn: () => response,
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories');
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <CategoryForm
                        formTitle="Course Edit form "
                        id={validatedParams.id}
                    />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
