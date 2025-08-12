import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import RefundsTable from '@/components/Admin/Refunds/refunds-table';
import { queryKeys } from '@/lib/query-keys';
import { adminGetRefunds } from '@/lib/server-actions/admin/refunds';
import { requireAdmin } from '@/utils/auth-guard';
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

export default async function RefundsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const searchParams = await props.searchParams;

  const page =
    typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const pageSize =
    typeof searchParams.pageSize === 'string'
      ? Number(searchParams.pageSize)
      : 10;
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : undefined;

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.refunds.list({
      page,
      pageSize,
      search,
      status,
    }),
    queryFn: async () =>
      await adminGetRefunds({
        page,
        pageSize,
        search,
        status,
      }),
  });

  return (
    <Suspense fallback="Loading...">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RefundsTable />
      </HydrationBoundary>
    </Suspense>
  );
}
