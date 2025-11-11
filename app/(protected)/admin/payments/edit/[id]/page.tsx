import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { notFound, redirect } from 'next/navigation';
import PaymentForm from '@/components/Admin/Payments/payment-form';
import { queryKeys } from '@/lib/query-keys';
import { adminPaymentDetails } from '@/lib/server-actions/admin/payments-optimized';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { Suspense } from 'react';
import {
    ZodAdminPaymentQuerySchema,
    ZodAdminPaymentQueryType,
} from '@/lib/db/drizzle-zod-schema';
import { normalizeProps } from '@/lib/normalizeProps';

import { IdParams, IdParamsSchema } from '@/lib/types/shared';

export default async function EditPaymentPage({
    params: promisedParams,
    searchParams: promisedSearchParams,
}: {
    params: Promise<IdParams>;
    searchParams: Promise<ZodAdminPaymentQueryType>;
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const { params: validatedParams, searchParams: validatedSearchParams } =
        await normalizeProps(
            IdParamsSchema,
            ZodAdminPaymentQuerySchema,
            params,
            searchParams
        );
    if (!validatedParams.id) {
        notFound();
    }
    const queryClient = getQueryClient();
    try {
        await queryClient.prefetchQuery({
            queryKey: queryKeys.payments.detail(validatedParams.id!),
            queryFn: () => adminPaymentDetails(validatedParams.id!),
        });
        await requireAdmin();
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories');
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense>
                    <PaymentForm
                        formTitle="Edit Payment Form"
                        id={validatedParams.id}
                    />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
