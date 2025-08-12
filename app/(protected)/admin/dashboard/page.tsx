import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import DashboardSummary from '@/components/Admin/Dashboard/dashboard-summary';
import { queryKeys } from '@/lib/query-keys';
import {
  getCachedEnrollmentsByStatus,
  getCachedPaymentsByStatus,
  getCachedTotalEnrollments,
  getCachedTotalIncome,
  getCachedTotalUsers,
} from '@/lib/server-actions/admin/dashboard';
import { requireAdmin } from '@/utils/auth-guard';
import { getQueryClient } from '@/utils/get-query-client';

export default async function DashboardPage() {
  await requireAdmin();

  const queryClient = getQueryClient();

  // Prefetch all dashboard data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.totalUsers,
      queryFn: getCachedTotalUsers,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.totalEnrollment,
      queryFn: getCachedTotalEnrollments,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.enrollmentByStatus,
      queryFn: getCachedEnrollmentsByStatus,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.totalIncome,
      queryFn: getCachedTotalIncome,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.paymentByStatus,
      queryFn: getCachedPaymentsByStatus,
    }),
  ]);

  return (
    <Suspense fallback="Loading...">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <DashboardSummary />
      </HydrationBoundary>
    </Suspense>
  );
}
