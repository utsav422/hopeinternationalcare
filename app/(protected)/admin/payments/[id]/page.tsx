import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import PaymentDetailsCard from '@/components/Admin/Payments/payment-details-card';
import {queryKeys} from '@/lib/query-keys';
import {adminPaymentDetails} from '@/lib/server-actions/admin/payments-optimized';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import {Suspense} from 'react';
import {ZodAdminPaymentQuerySchema, ZodAdminPaymentQueryType} from "@/lib/db/drizzle-zod-schema";
import {normalizeProps} from "@/lib/normalizeProps";
import {notFound, redirect} from "next/navigation";
import {IdParams, IdParamsSchema} from "@/lib/types/shared";


export default async function PaymentDetailsPage({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<IdParams>,
    searchParams: Promise<ZodAdminPaymentQueryType>;
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminPaymentQuerySchema, params, searchParams);
    if (!validatedParams.id) {
        notFound();
    }
    const queryClient = getQueryClient();
    try {
        await queryClient.prefetchQuery({
            queryKey: queryKeys.payments.detail(validatedParams.id as string),
            queryFn: () => adminPaymentDetails(validatedParams.id as string),
        });
        await requireAdmin();
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories')
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense>
                    <PaymentDetailsCard/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}

