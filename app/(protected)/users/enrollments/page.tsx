import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getUserEnrollments } from '@/lib/server-actions/user/enrollments-actions';
import { requireUser } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import UserEnrollments from './_components';
import { Suspense } from 'react';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function UserEnrollmentsPage() {
    const user = await requireUser();
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: queryKeys.enrollments.detailByUserId(user.id),
        queryFn: () => getUserEnrollments(),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense>
                    <UserEnrollments />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
