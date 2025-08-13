'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export const useGetDashboardSummary = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.all,
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/admin/dashboard?summary=true`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard summary');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard summary');
      }
      return result.data;
    },
  });
};

export const useGetTotalUsers = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalUsers,
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/admin/dashboard?totalUsers=true`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch total users');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch total users');
      }
      return result;
    },
  });
};

export const useGetTotalEnrollments = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalEnrollment,
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/admin/dashboard?totalEnrollments=true`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch total enrollments');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch total enrollments');
      }
      return result;
    },
  });
};

export const useGetEnrollmentsByStatus = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.enrollmentByStatus,
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/admin/dashboard?enrollmentsByStatus=true`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments by status');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error || 'Failed to fetch enrollments by status'
        );
      }
      return result;
    },
  });
};

export const useGetTotalIncome = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.totalIncome,
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/admin/dashboard?totalIncome=true`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch total income');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch total income');
      }
      return result;
    },
  });
};

export const useGetPaymentsByStatus = () => {
  return useSuspenseQuery({
    queryKey: queryKeys.dashboard.paymentByStatus,
    queryFn: async () => {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const response = await fetch(
        `${baseUrl}/api/admin/dashboard?paymentsByStatus=true`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch payments by status');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payments by status');
      }
      return result;
    },
  });
};
