import { desc, eq, like, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db/drizzle';
import type { PaymentDetailsType } from '@/lib/db/drizzle-zod-schema/payments';
import { courses as coursesTable } from '@/lib/db/schema/courses';
import { enrollments as enrollmentsTable } from '@/lib/db/schema/enrollments';
import type { TypePaymentStatus } from '@/lib/db/schema/enums';
import { intakes as intakeTable } from '@/lib/db/schema/intakes';
import {
  payments as paymentsSchema,
  payments as paymentsTable,
} from '@/lib/db/schema/payments';
import { profiles as profilesTable } from '@/lib/db/schema/profiles';
import { requireAdmin } from '@/utils/auth-guard';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const enrollmentId = searchParams.get('enrollmentId');
  const withOthers = searchParams.get('withOthers');

  if (id) {
    try {
      await requireAdmin();
      let payment: unknown;
      if (withOthers) {
        const result = await db
          .select({
            id: paymentsTable.id,
            amount: paymentsTable.amount,
            status: paymentsTable.status,
            paid_at: paymentsTable.paid_at,
            method: paymentsTable.method,
            remarks: paymentsTable.remarks,
            is_refunded: paymentsTable.is_refunded,
            enrollment_id: enrollmentsTable.id,
            enrolled_at: enrollmentsTable.created_at,
            enrollment_status: enrollmentsTable.status,
            user_id: enrollmentsTable.user_id,
            userEmail: profilesTable.email,
            userName: profilesTable.full_name,
            courseId: coursesTable.id,
            courseTitle: coursesTable.title,
          })
          .from(paymentsTable)
          .where(eq(paymentsTable.id, id))
          .leftJoin(
            enrollmentsTable,
            eq(paymentsTable.enrollment_id, enrollmentsTable.id)
          )
          .leftJoin(
            profilesTable,
            eq(enrollmentsTable.user_id, profilesTable.id)
          )
          .leftJoin(intakeTable, eq(enrollmentsTable.intake_id, intakeTable.id))
          .leftJoin(coursesTable, eq(intakeTable.course_id, coursesTable.id))
          .limit(1);
        payment = result[0] as PaymentDetailsType;
      } else {
        const result = await db
          .select()
          .from(paymentsTable)
          .where(eq(paymentsTable.id, id))
          .limit(1);
        payment = result[0];
      }

      if (!payment) {
        return NextResponse.json(
          { success: true, data: null },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: payment });
    } catch (error) {
      const e = error as Error;
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }
  }

  if (enrollmentId) {
    try {
      await requireAdmin();
      const payment = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.enrollment_id, enrollmentId))
        .limit(1);

      if (payment.length === 0) {
        return NextResponse.json(
          { success: true, data: null },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: payment[0] });
    } catch (error) {
      const e = error as Error;
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }
  }

  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') as TypePaymentStatus | null;

  try {
    const offset = (page - 1) * pageSize;

    let baseQuery = db
      .select({
        id: paymentsTable.id,
        amount: paymentsTable.amount,
        status: paymentsTable.status,
        paid_at: paymentsTable.paid_at,
        method: paymentsTable.method,
        remarks: paymentsTable.remarks,
        is_refunded: paymentsTable.is_refunded,
        enrollment_id: enrollmentsTable.id,
        enrolled_at: enrollmentsTable.created_at,
        enrollment_status: enrollmentsTable.status,
        user_id: enrollmentsTable.user_id,
        userEmail: profilesTable.email,
        userName: profilesTable.full_name,
        courseId: coursesTable.id,
        courseTitle: coursesTable.title,
      })
      .from(paymentsTable)
      .leftJoin(
        enrollmentsTable,
        eq(paymentsTable.enrollment_id, enrollmentsTable.id)
      )
      .leftJoin(profilesTable, eq(enrollmentsTable.user_id, profilesTable.id))
      .leftJoin(intakeTable, eq(enrollmentsTable.intake_id, intakeTable.id))
      .leftJoin(coursesTable, eq(intakeTable.course_id, coursesTable.id))
      .$dynamic();

    if (search) {
      baseQuery = baseQuery.where(like(profilesTable.full_name, `%${search}%`));
    }
    if (status) {
      baseQuery = baseQuery.where(eq(paymentsSchema.status, status));
    }
    const data = await baseQuery
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(paymentsTable.created_at));

    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(paymentsTable)
      .$dynamic();

    if (status) {
      countQuery = countQuery.where(eq(paymentsSchema.status, status));
    }
    const [{ count }] = await countQuery;
    return NextResponse.json({ success: true, data, total: count ?? 0 });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
