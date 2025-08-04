import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import Dashboard from '@/components/Admin/dashboard';
import { queryKeys } from '@/hooks/query-keys';
import { getDashboardSummaryData } from '@/server-actions/admin/dashboard';
import { getQueryClient } from '@/utils/get-query-client';

export default async function AdminDashboard() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: getDashboardSummaryData,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Dashboard />
    </HydrationBoundary>
  );
}
