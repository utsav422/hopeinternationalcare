'use server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import EnrollmentsTable from '@/components/Admin/Enrollments/enrollment-tables';
import { queryKeys } from '@/lib/query-keys';
import { adminEnrollmentList } from '@/lib/server-actions/admin/enrollments';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import {
    ZodAdminEnrollmentQuerySchema,
    ZodAdminEnrollmentQueryType,
} from '@/lib/db/drizzle-zod-schema';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/utils/auth-guard';
import { normalizeProps } from '@/lib/normalizeProps';
import { IdParamsSchema } from '@/lib/types/shared';

export default async function EnrollmentsPage({
    params: promisedParams,
    searchParams: promisedSearchParams,
}: {
    params: Promise<{}>;
    searchParams: Promise<ZodAdminEnrollmentQueryType>;
}) {
    // Await the promised params and searchParams
    const _params = await promisedParams;
    const searchParams = await promisedSearchParams;
    // Validate and normalize the props
    const { params: validatedParams, searchParams: validatedSearchParams } =
        await normalizeProps(
            IdParamsSchema,
            ZodAdminEnrollmentQuerySchema,
            _params,
            searchParams
        );

    const queryClient = getQueryClient();
    try {
        await requireAdmin();
        const page = Number(validatedSearchParams.page);
        const pageSize = Number(validatedSearchParams.pageSize);
        const filters = validatedSearchParams.filters;

        await queryClient.prefetchQuery({
            queryKey: queryKeys.enrollments.list({ page, pageSize, filters }),
            queryFn: () => adminEnrollmentList({ page, pageSize, filters }),
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories');
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <EnrollmentsTable />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
