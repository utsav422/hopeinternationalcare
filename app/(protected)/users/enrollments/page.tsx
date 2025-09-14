import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {queryKeys} from '@/lib/query-keys';
import {getCachedUserEnrollments} from '@/lib/server-actions/user/enrollments';
import {requireUser} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import UserEnrollments from './_components';
import {Suspense} from 'react';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import {logger} from "@/utils/logger";
import {redirect} from "next/navigation";

export default async function UserEnrollmentsPage() {
    const queryClient = getQueryClient();

    try {
        const user = await requireUser();
        await queryClient.prefetchQuery({
            queryKey: queryKeys.enrollments.detailByUserId(user.id),
            queryFn: () => getCachedUserEnrollments(),
        });
    } catch (e) {
        logger.error(e instanceof Error ? e?.message : 'Unknown error');
        redirect('/sign-in?redirect=/users/enrollments');
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense>
                    <UserEnrollments/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
