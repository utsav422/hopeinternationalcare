'use server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cache, Suspense } from 'react';
import AffiliationForm from '@/components/Admin/Affiliations/affiliation-form';
import { queryKeys } from '@/lib/query-keys';
import { adminAffiliationDetails } from '@/lib/server-actions/admin/affiliations-optimized';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { notFound, redirect } from 'next/navigation';
import { IdParams, IdParamsSchema } from '@/lib/types/shared';
import {
    ZodAdminAffiliationQuerySchema,
    ZodAdminAffiliationQueryType,
} from '@/lib/db/drizzle-zod-schema/affiliations';
import { normalizeProps } from '@/lib/normalizeProps';

const cachedAffiliationDetails = cache(adminAffiliationDetails);
// This function can be expanded to include caching logic if needed
export default async function EditAffiliation({
    params: promisedParams,
    searchParams: promisedSearchParams,
}: {
    params: Promise<IdParams>;
    searchParams: Promise<ZodAdminAffiliationQueryType>;
}) {
    // Await the promised params and searchParams
    const _params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const { params: validatedParams, searchParams: validatedSearchParams } =
        await normalizeProps(
            IdParamsSchema,
            ZodAdminAffiliationQuerySchema,
            _params,
            searchParams
        );

    const id = validatedParams.id;

    if (!id) {
        notFound();
    }

    await requireAdmin();

    const queryClient = getQueryClient();
    try {
        const response = await cachedAffiliationDetails(id);
        if (!response.success) {
            notFound();
        }
        console.log({ response });
        await queryClient.prefetchQuery({
            queryKey: queryKeys.affiliations.detail(id),
            queryFn: () => response,
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/affiliations');
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <AffiliationForm formTitle="Edit Affiliation" id={id} />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
