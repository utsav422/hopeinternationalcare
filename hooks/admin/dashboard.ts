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
    queryFn: async () => {
      const result = await getTotalUsers();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetTotalEnrollments = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalEnrollment,
    queryFn: async () => {
      const result = await getTotalEnrollments();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetEnrollmentsByStatus = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.enrollmentByStatus,
    queryFn: async () => {
      const result = await getEnrollmentsByStatus();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetTotalIncome = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalIncome,
    queryFn: async () => {
      const result = await getTotalIncome();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};

export const useGetPaymentsByStatus = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.paymentByStatus,
    queryFn: async () => {
      const result = await getPaymentsByStatus();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
};
