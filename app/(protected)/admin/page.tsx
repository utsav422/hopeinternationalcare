import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import Dashboard from '@/components/Admin/Dasboard';
import { queryKeys } from '@/lib/query-keys';
import {
  getEnrollmentsByStatus,
  getPaymentsByStatus,
  getTotalEnrollments,
  getTotalIncome,
  getTotalUsers,
} from '@/server-actions/admin/dashboard';
import { getQueryClient } from '@/utils/get-query-client';

export default async function AdminDashboard() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.totalIncome,
    queryFn: getTotalIncome,
  });
  await queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.totalEnrollment,
    queryFn: getTotalEnrollments,
  });
  await queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.totalUsers,
    queryFn: getTotalUsers,
  });
  await queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.enrollmentByStatus,
    queryFn: getEnrollmentsByStatus,
  });
  await queryClient.prefetchQuery({
    queryKey: queryKeys.dashboard.paymentByStatus,
    queryFn: getPaymentsByStatus,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Dashboard />
    </HydrationBoundary>
  );
}
