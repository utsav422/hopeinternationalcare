import {dehydrate, HydrationBoundary} from '@tanstack/react-query';
import {Suspense} from 'react';
import PaymentHistoryTable from '@/components/User/PaymentHistory/payment-history-table';
import {queryKeys} from '@/lib/query-keys';
import {getUserPaymentHistory} from '@/lib/server-actions/user/payments-optimized';
import {requireUser} from '@/utils/auth-guard';
import {getQueryClient} from '@/utils/get-query-client';
import {SearchParams} from "nuqs";
import {logger} from "@/utils/logger";
import {notFound, redirect} from "next/navigation";

export default async function PaymentHistoryPage(props: { searchParams: Promise<SearchParams> }) {
    const {page, pageSize} = await props.searchParams;
    const queryClient = getQueryClient();
    let userId: string | null | undefined = undefined;
    try {
        const user = await requireUser();
        await queryClient.prefetchQuery({
            queryKey: [...queryKeys.userPaymentHistory.all, Number(page), Number(pageSize), user.id],
            queryFn: async () => await getUserPaymentHistory(Number(page), Number(pageSize), user.id),
        });
        userId = user.id;
    } catch (e) {

        logger.error(e instanceof Error ? e?.message : 'Unknown error');
        redirect('/sign-in?redirect=/users/payment-history');
    }
    if (!userId) notFound()
    return (
        <Suspense fallback="Loading...">
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense>
                    <PaymentHistoryTable page={Number(page)} pageSize={Number(pageSize)} userId={userId as string}/>
                </Suspense>
            </HydrationBoundary>
        </Suspense>
    );
}


