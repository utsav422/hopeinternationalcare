import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getCachedAdminIntakeById } from '@/lib/server-actions/admin/intakes';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import IntakeForm from '../../../../../../components/Admin/Intakes/intake-form';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';
import { Suspense } from 'react';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function EditIntakePage(props: {
    params: Params;
    searchParams: SearchParams;
}) {
    await requireAdmin();
    const params = await props.params;

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: queryKeys.intakes.detail(params.id),
        queryFn: () => getCachedAdminIntakeById(params.id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense>
                    <IntakeForm formTitle="Edit Intake Form" id={params.id} />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
