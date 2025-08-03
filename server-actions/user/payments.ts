// /server-action/user/payments.ts
'use server';

import { and, eq } from 'drizzle-orm';
import { requireUser } from '@/utils/auth-guard';
import { db } from '@/utils/db/drizzle';
import { courses as coursesTable } from '@/utils/db/schema/courses';
import { enrollments as enrollmentsTable } from '@/utils/db/schema/enrollments';
import { intakes as intakesTable } from '@/utils/db/schema/intakes';
import { payments as paymentsTable } from '@/utils/db/schema/payments';

type PaymentInsert = typeof paymentsTable.$inferInsert;

/**
 * Create a new payment for an enrollment (must be owned by the current user)
 */
export async function createPayment(
  input: Omit<PaymentInsert, 'id' | 'status'> & {
    enrollment_id: number;
  }
) {
  const user = await requireUser();

  const { enrollment_id, amount: _, method: __, remarks: ___ } = input;

  // Ensure that this enrollment belongs to the current user
  const [enrollment] = await db
    .select({
      id: enrollmentsTable.id,
      user_id: enrollmentsTable.user_id,
    })
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.id, enrollment_id),
        eq(enrollmentsTable.user_id, user.id)
      )
    );

  if (!enrollment) {
    throw new Error('Enrollment not found or does not belong to you');
  }

  // Insert new payment
  const [newPayment] = await db
    .insert(paymentsTable)
    .values({
      ...input,
      enrollment_id,
      status: 'pending',
    })
    .returning();

  return newPayment;
}

/**
 * Get logged-in user’s payment history with course details
 */
export async function getUserPaymentHistory() {
  const user = await requireUser();

  if (user?.app_metadata.role !== 'authenticated') {
    throw new Error('Unauthorized');
  }
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
    .where(eq(enrollmentsTable.user_id, user.id));

  return data;
}
