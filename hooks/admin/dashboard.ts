'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
    adminDashboardSummaryData,
    adminDashboardTotalUsers,
    adminDashboardTotalEnrollments,
    adminDashboardEnrollmentsByStatus,
    adminDashboardTotalIncome,
    adminDashboardPaymentsByStatus,
} from '@/lib/server-actions/admin/dashboard';

export const useAdminDashboardSummary = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.all,
        queryFn: async () => {
            const result = await adminDashboardSummaryData();
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch dashboard summary'
                );
            }
            return result.data;
        },
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminDashboardTotalUsers = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.totalUsers,
        queryFn: async () => {
            const result = await adminDashboardTotalUsers();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch total users');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminDashboardTotalEnrollments = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.totalEnrollment,
        queryFn: async () => {
            const result = await adminDashboardTotalEnrollments();
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch total enrollments'
                );
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminDashboardEnrollmentListByStatus = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.enrollmentByStatus,
        queryFn: async () => {
            const result = await adminDashboardEnrollmentsByStatus();
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch enrollments by status'
                );
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminDashboardTotalIncome = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.totalIncome,
        queryFn: async () => {
            const result = await adminDashboardTotalIncome();
            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch total income');
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useAdminDashboardPaymentListByStatus = () => {
    return useSuspenseQuery({
        queryKey: queryKeys.dashboard.paymentByStatus,
        queryFn: async () => {
            const result = await adminDashboardPaymentsByStatus();
            if (!result.success) {
                throw new Error(
                    result.error || 'Failed to fetch payments by status'
                );
            }
            return result;
        },
        staleTime: 1000 * 60 * 5, //5minutes
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};
