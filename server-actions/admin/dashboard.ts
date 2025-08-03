'use server';

import type {
  TypeEnrollmentStatus,
  TypePaymentStatus,
} from '@/utils/db/schema/enums';

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

import { createClient } from '@/utils/supabase/server';

export async function getDashboardSummaryData(): Promise<DashboardSummary> {
  const client = await createClient();
  // Total Users
  const { count: totalUsers } = await client
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'authenticated');

  // Total Enrollments
  const { count: totalEnrollments } = await client
    .from('enrollments')
    .select('*', { count: 'exact', head: true });

  // Enrollments by Status
  const { data: enrollmentsData } = await client
    .from('enrollments')
    .select('status');

  const enrollmentsByStatusMap = (enrollmentsData ?? []).reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    {} as Record<TypeEnrollmentStatus, number>
  );

  const enrollmentsByStatus = Object.entries(enrollmentsByStatusMap).map(
    ([status, count]) => ({
      status: status as TypeEnrollmentStatus,
      count,
    })
  );

  // Total Income (completed payments)
  const { data: totalIncomeData } = await client
    .from('payments')
    .select('amount')
    .eq('status', 'completed');

  const totalIncome =
    totalIncomeData?.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;

  // Payments by Status
  const { data: paymentsData } = await client
    .from('payments')
    .select('status, amount');

  const paymentsByStatusMap = (paymentsData ?? []).reduce(
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

  const paymentsByStatus = Object.entries(paymentsByStatusMap).map(
    ([status, data]) => ({
      status: status as TypePaymentStatus,
      count: data.count,
      totalAmount: data.totalAmount,
    })
  );

  return {
    totalUsers: totalUsers ?? 0,
    totalEnrollments: totalEnrollments ?? 0,
    enrollmentsByStatus: (enrollmentsByStatus ?? []).map((e) => ({
      status: e.status as TypeEnrollmentStatus,
      count: e.count ?? 0,
    })),
    totalIncome,
    paymentsByStatus: (paymentsByStatus ?? []).map((p) => ({
      status: p.status as TypePaymentStatus,
      count: p.count ?? 0,
      totalAmount: p.totalAmount ?? 0,
    })),
  };
}
