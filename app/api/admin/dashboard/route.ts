import { type NextRequest, NextResponse } from 'next/server';
import {
  getDashboardSummaryData,
  getEnrollmentsByStatus,
  getPaymentsByStatus,
  getTotalEnrollments,
  getTotalIncome,
  getTotalUsers,
} from '@/lib/server-actions/admin/dashboard';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const summary = searchParams.get('summary');
  const totalUsers = searchParams.get('totalUsers');
  const totalEnrollments = searchParams.get('totalEnrollments');
  const enrollmentsByStatus = searchParams.get('enrollmentsByStatus');
  const totalIncome = searchParams.get('totalIncome');
  const paymentsByStatus = searchParams.get('paymentsByStatus');

  try {
    if (summary) {
      const result = await getDashboardSummaryData();
      return NextResponse.json(result);
    }
    if (totalUsers) {
      const result = await getTotalUsers();
      return NextResponse.json(result);
    }
    if (totalEnrollments) {
      const result = await getTotalEnrollments();
      return NextResponse.json(result);
    }
    if (enrollmentsByStatus) {
      const result = await getEnrollmentsByStatus();
      return NextResponse.json(result);
    }
    if (totalIncome) {
      const result = await getTotalIncome();
      return NextResponse.json(result);
    }
    if (paymentsByStatus) {
      const result = await getPaymentsByStatus();
      return NextResponse.json(result);
    }

    // Default to summary if no specific query param is provided
    const result = await getDashboardSummaryData();
    return NextResponse.json(result);
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
