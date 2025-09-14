import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {notFound, redirect} from 'next/navigation';
import {Suspense} from 'react';
import EnrollmentFormModal from '@/components/Admin/Enrollments/enrollment-form';
import {queryKeys} from '@/lib/query-keys';
import {cachedAdminEnrollmentDetailsById} from '@/lib/server-actions/admin/enrollments';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import {ZodAdminEnrollmentQuerySchema, ZodAdminEnrollmentQueryType} from "@/lib/db/drizzle-zod-schema";
import {normalizeProps} from "@/lib/normalizeProps";

import {IdParams, IdParamsSchema} from "@/lib/types/shared";

export default async function EditEnrollment({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<IdParams>,
    searchParams: Promise<ZodAdminEnrollmentQueryType>
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminEnrollmentQuerySchema, params, searchParams);
    if (!validatedParams.id) {
        notFound();
    }
    const queryClient = getQueryClient();
    try {
        await requireAdmin();
        const response = await cachedAdminEnrollmentDetailsById(validatedParams.id);
        if (!response.success) {
            notFound();
        }

        await queryClient.prefetchQuery({
            queryKey: queryKeys.enrollments.detail(validatedParams.id),
            queryFn: () => response,
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories')
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback="Loading...">
                    <EnrollmentFormModal formTitle="Edit Enrollment Details" id={validatedParams.id}/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}

