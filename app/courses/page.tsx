import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/hooks/query-keys';
import { getPublicCourses } from '@/server-actions/public/courses';
import { AllCourses } from './courses';

export default async function Campaign() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.publicCourses.list({ page: 1, pageSize: 10 }),
    queryFn: () => getPublicCourses({ page: 1, pageSize: 10 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="pt-20">
        <AllCourses />
      </div>
    </HydrationBoundary>
  );
}
