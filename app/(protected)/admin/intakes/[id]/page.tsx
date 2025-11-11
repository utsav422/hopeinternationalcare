import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import IntakeDetails from '@/components/Admin/Intakes/intake-details';
import { queryKeys } from '@/lib/query-keys';
import { adminIntakeDetails } from '@/lib/server-actions/admin/intakes-optimized';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { Suspense } from 'react';
import {
    ZodAdminIntakeQuerySchema,
    ZodAdminIntakeQueryType,
} from '@/lib/db/drizzle-zod-schema';
import { normalizeProps } from '@/lib/normalizeProps';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/utils/auth-guard';
import { IdParams, IdParamsSchema } from '@/lib/types/shared';

export default async function IntakeDetailsPage({
    params: promisedParams,
    searchParams: promisedSearchParams,
}: {
    params: Promise<IdParams>;
    searchParams: Promise<ZodAdminIntakeQueryType>;
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const { params: validatedParams, searchParams: validatedSearchParams } =
        await normalizeProps(
            IdParamsSchema,
            ZodAdminIntakeQuerySchema,
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
            queryKey: queryKeys.intakes.detail(validatedParams.id as string),
            queryFn: () => adminIntakeDetails(validatedParams.id as string),
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories');
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense>
                    <IntakeDetails />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
