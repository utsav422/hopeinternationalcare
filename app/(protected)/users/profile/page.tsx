import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Suspense} from 'react';
import {queryKeys} from '@/lib/query-keys';
import {requireUser} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {QueryErrorWrapper} from '@/components/Custom/query-error-wrapper';
import UserProfileComponent from './_components/user-profile';
import {logger} from "@/utils/logger";
import {redirect} from "next/navigation";

export default async function ProfilePage() {
    const queryClient = getQueryClient();

    try {
        const user = await requireUser();
        await queryClient.prefetchQuery({
            queryKey: queryKeys.users.session,
            queryFn: () => Promise.resolve(user),
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60, // 1 hour
        });
    } catch (e) {
        logger.error(e instanceof Error ? e?.message : 'Unknown error');
        redirect('/sign-in?redirect=/users/enrollments');
    }
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QueryErrorWrapper>
                <Suspense fallback={<div>Loading profile...</div>}>
                    <UserProfileComponent/>
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
