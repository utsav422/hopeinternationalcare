import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import EnrollmentDetailsCard from '@/components/Admin/Enrollments/enrollment-details-card';
import { queryKeys } from '@/lib/query-keys';
import { cachedAdminEnrollmentDetailsById } from '@/lib/server-actions/admin/enrollments';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import {
    ZodAdminEnrollmentQuerySchema,
    ZodAdminEnrollmentQueryType,
} from '@/lib/db/drizzle-zod-schema';
import { normalizeProps } from '@/lib/normalizeProps';
import { notFound, redirect } from 'next/navigation';
import { IdParams, IdParamsSchema } from '@/lib/types/shared';

export default async function Enrollments({
    params: promisedParams,
    searchParams: promisedSearchParams,
}: {
    params: Promise<IdParams>;
    searchParams: Promise<ZodAdminEnrollmentQueryType>;
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const { params: validatedParams, searchParams: validatedSearchParams } =
        await normalizeProps(
            IdParamsSchema,
            ZodAdminEnrollmentQuerySchema,
            params,
            searchParams
        );
    if (!validatedParams.id) {
        notFound();
    }
    const queryClient = getQueryClient();
    try {
        await requireAdmin();
        await queryClient.prefetchQuery({
            queryKey: queryKeys.enrollments.detail(validatedParams.id),
            queryFn: () =>
                cachedAdminEnrollmentDetailsById(validatedParams.id as string),
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories');
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <EnrollmentDetailsCard />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
