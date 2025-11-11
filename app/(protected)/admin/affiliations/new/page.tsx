'use server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import AffiliationForm from '@/components/Admin/Affiliations/affiliation-form';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { queryKeys } from '@/lib/query-keys';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { Suspense } from 'react';

export default async function NewAffiliation() {
    await requireAdmin();

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: queryKeys.affiliations.detail(''),
        queryFn: () =>
            Promise.resolve({ data: null, success: true, error: '' }),
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback="Loading...">
                <AffiliationForm formTitle="Create New Affiliation" />
            </Suspense>
        </HydrationBoundary>
    );
}
