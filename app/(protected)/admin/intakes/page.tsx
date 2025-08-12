'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import { queryKeys } from '@/lib/query-keys';
import { adminGetIntakes } from '@/lib/server-actions/admin/intakes';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';
import IntakesTables from '../../../../components/Admin/Intakes/intakes-tables';

export default async function IntakesPage(props: {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    sortBy?: string;
    order?: 'desc' | 'asc';
    filters?: string;
    [key: string]: string | string[] | undefined;
  }>;
}) {
  const {
    page = '1',
    pageSize = '10',
    sortBy = 'created_at',
    order = 'desc',
    filters = '[]',
  } = await props.searchParams;

  await requireAdmin();

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.intakes.list({
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy,
      order,
      filters: JSON.parse(filters as string),
    }),
    queryFn: async () =>
      await adminGetIntakes({
        page: Number(page),
        pageSize: Number(pageSize),
        sortBy,
        order,
        filters: JSON.parse(filters as string),
      }),
  });

  return (
    <Suspense fallback="Loading...">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <IntakesTables />
      </HydrationBoundary>
    </Suspense>
  );
}
