'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import EnrollmentTables from '@/components/Admin/Enrollments/enrollment-tables';
import { queryKeys } from '@/hooks/query-keys';
import { adminGetEnrollments } from '@/server-actions/admin/enrollments';
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

export default async function EnrollmentsPage(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const _searchParams = await props.searchParams;
  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: queryKeys.enrollments.list({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      order: 'desc',
      filters: [],
    }),
    queryFn: async () =>
      await adminGetEnrollments({
        page: 1,
        pageSize: 10,
        sortBy: 'created_at',
        order: 'desc',
        filters: [],
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EnrollmentTables />
    </HydrationBoundary>
  );
}
