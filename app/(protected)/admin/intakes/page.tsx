'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { adminGetIntakes } from '@/server-actions/admin/intakes';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import IntakesTables from '../../../../components/Admin/Intakes/intakes-tables';

export default async function IntakesPage(props: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    order?: string;
    filters?: string;
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const _searchParams = await props.searchParams;

  await requireAdmin();

  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: queryKeys.intakes.list({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      order: 'desc',
      filters: [],
    }),
    queryFn: async () =>
      await adminGetIntakes({
        page: 1,
        pageSize: 10,
        sortBy: 'created_at',
        order: 'desc',
        filters: [],
      }),
  });

  await adminGetIntakes({
    page: 1,
    pageSize: 10,
    filters: [],
    order: 'desc',
    sortBy: 'created_at',
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IntakesTables />
    </HydrationBoundary>
  );
}
