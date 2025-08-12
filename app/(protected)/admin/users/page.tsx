import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import UserList from '@/components/Admin/Users';
import { queryKeys } from '@/lib/query-keys';
import { getUserList } from '@/lib/server-actions/admin/users';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ [key: string]: string }>;
type SearchParams = Promise<{
  page?: string;
  pageSize?: string;
  sortBy?: string;
  order?: string;
  filters?: string;
  [key: string]: string | string[] | undefined;
}>;

export default async function UserPage(props: {
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

  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => await getUserList(page, pageSize),
  });

  return (
    <Suspense fallback="Loading...">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UserList />
      </HydrationBoundary>
    </Suspense>
  );
}
