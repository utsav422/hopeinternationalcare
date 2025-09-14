import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {notFound, redirect} from 'next/navigation';
import {queryKeys} from '@/lib/query-keys';
import {cachedAdminIntakeDetailsById} from '@/lib/server-actions/admin/intakes';
import {requireAdmin} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import IntakeForm from '../../../../../../components/Admin/Intakes/intake-form';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import {Suspense} from 'react';
import {ZodAdminCourseCategoryQuerySchema, ZodAdminCourseCategoryQueryType} from "@/lib/db/drizzle-zod-schema";
import {normalizeProps} from "@/lib/normalizeProps";
import {IdParams, IdParamsSchema} from "@/lib/types/shared";


export default async function EditIntakePage({params: promisedParams, searchParams: promisedSearchParams}: {
    params: Promise<IdParams>,
    searchParams: Promise<ZodAdminCourseCategoryQueryType>
}) {
    // Await the promised params and searchParams
    const params = await promisedParams;
    const searchParams = await promisedSearchParams;

    // Validate and normalize the props
    const {
        params: validatedParams,
        searchParams: validatedSearchParams
    } = await normalizeProps(IdParamsSchema, ZodAdminCourseCategoryQuerySchema, params, searchParams);
    if (!validatedParams.id) {
        notFound();
    }
    const queryClient = getQueryClient();
    try {
        await requireAdmin();
        const response = await cachedAdminIntakeDetailsById(validatedParams.id);
        if (!response.success) {
            notFound();
        }

        await queryClient.prefetchQuery({
            queryKey: queryKeys.intakes.detail(validatedParams.id),
            queryFn: () => response,
        });
    } catch (error) {
        redirect('/admin-auth/sign-in?redirect=/admin/categories')
    }


    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense>
                    <IntakeForm formTitle="Edit Intake Form" id={validatedParams.id}/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}

