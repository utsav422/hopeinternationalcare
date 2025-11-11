import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { requireAdmin } from '@/utils/auth-guard';
import IntakeForm from '../../../../../components/Admin/Intakes/intake-form';
import FormSkeleton from '@/components/Custom/form-skeleton';
import { queryKeys } from '@/lib/query-keys';
import { cachedAdminCourseListAll } from '@/lib/server-actions/admin/courses-optimized';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function NewIntakePage() {
    await requireAdmin();

    const queryClient = getQueryClient();

    // Prefetch empty intake data and courses for new form
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: queryKeys.intakes.detail(''),
            queryFn: () =>
                Promise.resolve({ data: null, success: false, error: '' }),
            staleTime: 1000 * 60 * 5, //5minutes
            gcTime: 1000 * 60 * 60, // 1 hour
        }),
        queryClient.prefetchQuery({
            queryKey: queryKeys.courses.lists(),
            queryFn: cachedAdminCourseListAll,
            staleTime: 1000 * 60 * 5, //5minutes
            gcTime: 1000 * 60 * 60, // 1 hour
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback={<FormSkeleton />}>
                    <IntakeForm formTitle="Create new Intake Form" />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
