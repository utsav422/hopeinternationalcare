'use server';

import { cache } from 'react';
import type {
  TypeEnrollmentStatus,
  TypePaymentStatus,
} from '@/utils/db/schema/enums';
import { createServerSupabaseClient } from '@/utils/supabase/server';
export interface DashboardSummary {
  totalUsers: number;
  totalEnrollments: number;
  enrollmentsByStatus: { status: TypeEnrollmentStatus; count: number }[];
  totalIncome: number;
  paymentsByStatus: {
    status: TypePaymentStatus;
    count: number;
    totalAmount: number;
  }[];
}

// 1. Get total users
export async function getTotalUsers(): Promise<number> {
  const client = await createServerSupabaseClient();

  const { count } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'authenticated');
  return count ?? 0;
}
// 2. Get total enrollments
export async function getTotalEnrollments(): Promise<number> {
  const client = await createServerSupabaseClient();

  const { count } = await client
    .from('enrollments')
    .select('*', { count: 'exact', head: true });
  return count ?? 0;
}

// 3. Get enrollments by status
export async function getEnrollmentsByStatus(): Promise<
  { status: TypeEnrollmentStatus; count: number }[]
> {
  const client = await createServerSupabaseClient();

  const { data } = await client.from('enrollments').select('status');

  const map = (data ?? []).reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    {} as Record<TypeEnrollmentStatus, number>
  );

  return Object.entries(map).map(([status, count]) => ({
    status: status as TypeEnrollmentStatus,
    count,
  }));
}
// 4. Get total income from completed payments
export async function getTotalIncome(): Promise<number> {
  const client = await createServerSupabaseClient();

  const { data } = await client
    .from('payments')
    .select('amount')
    .eq('status', 'completed');
  return data?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
}
// 5. Get payments by status
export async function getPaymentsByStatus(): Promise<
  { status: TypePaymentStatus; count: number; totalAmount: number }[]
> {
  const client = await createServerSupabaseClient();

  const { data } = await client.from('payments').select('status, amount');

  const map = (data ?? []).reduce(
    (acc, curr) => {
      if (!acc[curr.status]) {
        acc[curr.status] = { count: 0, totalAmount: 0 };
      }
      acc[curr.status].count += 1;
      acc[curr.status].totalAmount += curr.amount;
      return acc;
    },
    {} as Record<TypePaymentStatus, { count: number; totalAmount: number }>
  );

  return Object.entries(map).map(([status, info]) => ({
    status: status as TypePaymentStatus,
    count: info.count,
    totalAmount: info.totalAmount,
  }));
}

export async function getDashboardSummaryData(): Promise<DashboardSummary> {
  const [
    totalUsers,
    totalEnrollments,
    enrollmentsByStatus,
    totalIncome,
    paymentsByStatus,
  ] = await Promise.all([
    getTotalUsers(),
    getTotalEnrollments(),
    getEnrollmentsByStatus(),
    getTotalIncome(),
    getPaymentsByStatus(),
  ]);

  return {
    totalUsers,
    totalEnrollments,
    enrollmentsByStatus,
    totalIncome,
    paymentsByStatus,
  };
}

export const getCachedDashboardSummaryData = cache(getDashboardSummaryData);
export const getCachedTotalUsers = cache(getTotalUsers);
export const getCachedTotalEnrollments = cache(getTotalEnrollments);
export const getCachedEnrollmentsByStatus = cache(getEnrollmentsByStatus);
export const getCachedTotalIncome = cache(getTotalIncome);
export const getCachedPaymentsByStatus = cache(getPaymentsByStatus);
