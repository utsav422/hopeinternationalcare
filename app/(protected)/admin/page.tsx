import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';
import Dashboard from '@/components/Admin/Dasboard';
import { queryKeys } from '@/lib/query-keys';
import {
    adminDashboardEnrollmentsByStatus,
    adminDashboardPaymentsByStatus,
    adminDashboardTotalEnrollments,
    adminDashboardTotalIncome,
    adminDashboardTotalUsers,
} from '@/lib/server-actions/admin/dashboard';
import { getQueryClient } from '@/utils/get-query-client';
import { QueryErrorWrapper } from '@/components/Custom/query-error-wrapper';

export default async function AdminDashboard() {
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.totalIncome,
        queryFn: adminDashboardTotalIncome,
    });
    await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.totalUsers,
        queryFn: adminDashboardTotalUsers,
    });
    await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.totalEnrollment,
        queryFn: adminDashboardTotalEnrollments,
    });
    await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.paymentByStatus,
        queryFn: adminDashboardPaymentsByStatus,
    });
    await queryClient.prefetchQuery({
        queryKey: queryKeys.dashboard.enrollmentByStatus,
        queryFn: adminDashboardEnrollmentsByStatus,
    });

    const dehydratedState = dehydrate(queryClient);

    return (
        <HydrationBoundary state={dehydratedState}>
            <QueryErrorWrapper>
                <Suspense fallback={<div>Loading...</div>}>
                    <Dashboard />
                </Suspense>
            </QueryErrorWrapper>
        </HydrationBoundary>
    );
}
