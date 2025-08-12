import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import PaymentHistoryTable from '@/components/User/PaymentHistory/payment-history-table';
import { queryKeys } from '@/lib/query-keys';
import { getUserPaymentHistory } from '@/lib/server-actions/user/payments';
import { requireUser } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{
  page?: string;
  pageSize?: string;
  sortBy?: string;
  order?: string;
  filters?: string;
  [key: string]: string | string[] | undefined;
}>;

export default async function PaymentHistoryPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const searchParams = await props.searchParams;

  const page =
    typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const pageSize =
    typeof searchParams.pageSize === 'string'
      ? Number(searchParams.pageSize)
      : 10;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: [...queryKeys.userPaymentHistory.all, user.id, page, pageSize],
    queryFn: async () => await getUserPaymentHistory(page, pageSize),
  });

  return (
    <Suspense fallback="Loading...">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PaymentHistoryTable page={page} pageSize={pageSize} />
      </HydrationBoundary>
    </Suspense>
  );
}
