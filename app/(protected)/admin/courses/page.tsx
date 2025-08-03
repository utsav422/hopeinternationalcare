'use server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import CourseTable from '@/components/Admin/Courses/course-table';
import { queryKeys } from '@/hooks/query-keys';
import { adminGetCourses } from '@/server-actions/admin/courses';
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

export default async function Courses(props: {
  params: Params;
  searchParams: SearchParams;
}) {
  const _searchParams = await props.searchParams;

  const queryClient = getQueryClient();
  queryClient.prefetchQuery({
    queryKey: queryKeys.courses.list({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      order: 'desc',
      filters: [],
    }),
    queryFn: async () =>
      adminGetCourses({
        page: 1,
        pageSize: 10,
        sortBy: 'created_at',
        order: 'desc',
        filters: [],
      }),
  });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CourseTable />
    </HydrationBoundary>
  );
}
