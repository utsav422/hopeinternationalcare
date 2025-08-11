'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  getDashboardSummaryData,
  getEnrollmentsByStatus,
  getPaymentsByStatus,
  getTotalEnrollments,
  getTotalIncome,
  getTotalUsers,
} from '@/server-actions/admin/dashboard';
import { queryKeys } from '../../lib/query-keys';

export const useDashboardSummary = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: () => getDashboardSummaryData(),
  });
};

export const useGetEnrollementByStatus = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.enrollmentByStatus,
    queryFn: () => getEnrollmentsByStatus(),
  });
};
export const useGetPaymentByStatus = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.paymentByStatus,
    queryFn: () => getPaymentsByStatus(),
  });
};

export const useGetTotalEnrollment = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalEnrollment,
    queryFn: () => getTotalEnrollments(),
  });
};
export const useGetTotalIncome = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalIncome,
    queryFn: getTotalIncome,
  });
};

export const useGetTotalUsers = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalUsers,
    queryFn: () => getTotalUsers(),
  });
};
