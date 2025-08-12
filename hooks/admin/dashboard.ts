'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import {
  getDashboardSummaryData,
  getEnrollmentsByStatus,
  getPaymentsByStatus,
  getTotalEnrollments,
  getTotalIncome,
  getTotalUsers,
} from '@/lib/server-actions/admin/dashboard';

export const useGetDashboardSummary = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: async () => {
      const result = await getDashboardSummaryData();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetTotalUsers = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalUsers,
    queryFn: async () => await getTotalUsers(),
  });
};

export const useGetTotalEnrollments = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalEnrollment,
    queryFn: async () => await getTotalEnrollments(),
  });
};

export const useGetEnrollmentsByStatus = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.enrollmentByStatus,
    queryFn: async () => await getEnrollmentsByStatus(),
  });
};

export const useGetTotalIncome = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalIncome,
    queryFn: async () => await getTotalIncome(),
  });
};

export const useGetPaymentsByStatus = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.paymentByStatus,
    queryFn: async () => await getPaymentsByStatus(),
  });
};
