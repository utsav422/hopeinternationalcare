'use server';

import { cache } from 'react';
import type {
  TypeEnrollmentStatus,
  TypePaymentStatus,
} from '@/lib/db/schema/enums';
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
export async function getTotalUsers() {
  try {
    const client = await createServerSupabaseClient();

    const { count } = await client
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'authenticated');
    return { success: true, data: count ?? 0 };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
// 2. Get total enrollments
export async function getTotalEnrollments() {
  try {
    const client = await createServerSupabaseClient();

    const { count } = await client
      .from('enrollments')
      .select('*', { count: 'exact', head: true });
    return { success: true, data: count ?? 0 };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

// 3. Get enrollments by status
export async function getEnrollmentsByStatus() {
  try {
    const client = await createServerSupabaseClient();

    const { data } = await client.from('enrollments').select('status');

    const map = (data ?? []).reduce(
      (acc, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      },
      {} as Record<TypeEnrollmentStatus, number>
    );

    const result = Object.entries(map).map(([status, count]) => ({
      status: status as TypeEnrollmentStatus,
      count,
    }));
    return { success: true, data: result };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
// 4. Get total income from completed payments
export async function getTotalIncome() {
  try {
    const client = await createServerSupabaseClient();

    const { data } = await client
      .from('payments')
      .select('amount')
      .eq('status', 'completed');
    const result = data?.reduce((sum, p) => sum + p.amount, 0) ?? 0;
    return { success: true, data: result };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
// 5. Get payments by status
export async function getPaymentsByStatus() {
  try {
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

    const result = Object.entries(map).map(([status, info]) => ({
      status: status as TypePaymentStatus,
      count: info.count,
      totalAmount: info.totalAmount,
    }));
    return { success: true, data: result };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function getDashboardSummaryData() {
  try {
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

    if (
      !(
        totalUsers.success &&
        totalEnrollments.success &&
        enrollmentsByStatus.success &&
        totalIncome.success &&
        paymentsByStatus.success
      )
    ) {
      throw new Error('Failed to fetch dashboard summary data');
    }

    const result: DashboardSummary = {
      totalUsers: totalUsers?.data ?? Number.NaN,
      totalEnrollments: totalEnrollments?.data ?? Number.NaN,
      enrollmentsByStatus: enrollmentsByStatus?.data ?? [],
      totalIncome: totalIncome?.data ?? Number.NaN,
      paymentsByStatus: paymentsByStatus?.data ?? [],
    };
    return { success: true, data: result };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export const getCachedDashboardSummaryData = cache(getDashboardSummaryData);
export const getCachedTotalUsers = cache(getTotalUsers);
export const getCachedTotalEnrollments = cache(getTotalEnrollments);
export const getCachedEnrollmentsByStatus = cache(getEnrollmentsByStatus);
export const getCachedTotalIncome = cache(getTotalIncome);
export const getCachedPaymentsByStatus = cache(getPaymentsByStatus);
