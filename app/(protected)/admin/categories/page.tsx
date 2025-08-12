'use server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import CategoriesTable from '@/components/Admin/categories/categories-table';
import { queryKeys } from '@/lib/query-keys';
import { adminGetCoursesCategories } from '@/lib/server-actions/admin/courses-categories';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{
  page?: string;
  pageSize?: string;
  sortBy?: string;
  order?: string;
  filters?: string;
  [key: string]: string | string[] | undefined;
}>;

export default async function CategoriesPage(_props: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireAdmin();
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: [
      queryKeys.courseCategories.list({
        page: 1,
        pageSize: 10,
        sortBy: 'created_at',
        order: 'desc',
        filters: [],
      }),
    ],
    queryFn: async () =>
      await adminGetCoursesCategories({
        page: 1,
        pageSize: 10,
        sortBy: 'created_at',
        order: 'desc',
        filters: [],
      }),
  });

  return (
    <Suspense fallback="Loading...">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CategoriesTable />
      </HydrationBoundary>
    </Suspense>
  );
}
