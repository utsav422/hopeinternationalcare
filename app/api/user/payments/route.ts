import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse as Response } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses as coursesTable } from '@/lib/db/schema/courses';
import { enrollments as enrollmentsTable } from '@/lib/db/schema/enrollments';
import { intakes as intakesTable } from '@/lib/db/schema/intakes';
import { payments as paymentsTable } from '@/lib/db/schema/payments';
import { requireUser } from '@/utils/auth-guard';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();

    if (user?.app_metadata.role !== 'authenticated') {
      return Response.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10);
    const offset = (page - 1) * pageSize;

    const data = await db
      .select({
        paymentId: paymentsTable.id,
        amount: paymentsTable.amount,
        status: paymentsTable.status,
        paid_at: paymentsTable.paid_at,
        created_at: paymentsTable.created_at,

        intake_id: enrollmentsTable.intake_id,
        courseId: intakesTable.course_id,
        courseName: coursesTable.title,
      })
      .from(paymentsTable)
      .leftJoin(
        enrollmentsTable,
        eq(paymentsTable.enrollment_id, enrollmentsTable.id)
      )
      .leftJoin(intakesTable, eq(enrollmentsTable.intake_id, intakesTable.id))
      .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
      .where(eq(enrollmentsTable.user_id, user.id))
      .limit(pageSize)
      .offset(offset);

    return Response.json({ success: true, data });
  } catch (error) {
    const e = error as Error;
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
