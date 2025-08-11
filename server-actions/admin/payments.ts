'use server';

import { desc, eq, like, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { requireAdmin } from '@/utils/auth-guard';
import { db } from '@/utils/db/drizzle';
import {
  type PaymentDetailsType,
  ZodPaymentInsertSchema,
  type ZodSelectPaymentType,
} from '@/utils/db/drizzle-zod-schema/payments';
import { courses as coursesTable } from '@/utils/db/schema/courses';
import { enrollments as enrollmentsTable } from '@/utils/db/schema/enrollments';
import type { TypePaymentStatus } from '@/utils/db/schema/enums';
import { intakes as intakeTable } from '@/utils/db/schema/intakes';
import {
  payments as paymentsSchema,
  payments as paymentsTable,
} from '@/utils/db/schema/payments';
import { profiles as profilesTable } from '@/utils/db/schema/profiles';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { createServerSupabaseClient } from '@/utils/supabase/server';

/**
 * Get list of payments with user/course details
 */
type PaymentListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TypePaymentStatus;
};
export async function adminGetPayments({
  page = 1,
  pageSize = 10,
  search = '',
  status,
}: PaymentListParams) {
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
  if (status && (status as 'pending' | 'completed' | 'failed' | 'refunded')) {
    baseQuery = baseQuery.where(
      eq(
        paymentsSchema.status,
        status as 'pending' | 'completed' | 'failed' | 'refunded'
      )
    );
  }
  const data = await baseQuery
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(paymentsTable.created_at));

  let countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(paymentsTable)
    .$dynamic();

  if (status && (status as 'pending' | 'completed' | 'failed' | 'refunded')) {
    countQuery = countQuery.where(
      eq(
        paymentsSchema.status,
        status as 'pending' | 'completed' | 'failed' | 'refunded'
      )
    );
  }
  const [{ count }] = await countQuery;
  return { data, total: count ?? 0 };
}

/**
 * Update payment status
 */
export async function adminUpdatePaymentStatus(
  id: string,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  remarks?: string
) {
  const { user } = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  await db
    .update(paymentsTable)
    .set({ status, remarks })
    .where(eq(paymentsTable.id, id));

  revalidatePath('/admin/payments');
}

/**
 * Create or update payment
 */
type PaymentFormInput = TablesInsert<'payments'>;
export async function adminUpsertPayment(input: PaymentFormInput) {
  const { user } = await requireAdmin();
  if (!user || user.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  const validatedFields = ZodPaymentInsertSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.message,
    };
  }
  const client = await createServerSupabaseClient();

  const { data, error } = await client
    .from('payments')
    .upsert(
      {
        ...validatedFields.data,
      },
      { onConflict: 'id' }
    )
    .select();

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath('/admin/payments');

  return {
    data,
    success: true,
    message: input.id
      ? 'Payment updated successfully'
      : 'Payment created successfully',
  };
}

/**
 * get payment details From enrolment_id
 */
export async function adminGetPaymentDetailsByEnrollmentId(
  enrollmentId: string
) {
  const { user } = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  const payment = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.enrollment_id, enrollmentId))
    .limit(1);

  if (payment.length === 0) {
    return {
      success: true,
      data: null,
      message: "this enrollment doesn't have any payment record",
    };
  }
  if (payment.length > 0) {
    return {
      success: true,
      data: payment[0] as ZodSelectPaymentType,
      message: 'Payment details retrived successfully.',
    };
  }
  return {
    success: false,
    message: 'Unkown Error, Contact to adminstrator',
  };
}
/**
 * get payment details From id
 */
export async function adminGetPaymentOnlyDetailsById(paymentId: string) {
  const { user } = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  const payment = await db
    .select()

    .from(paymentsTable)
    .where(eq(paymentsTable.id, paymentId))

    .limit(1);

  if (payment.length === 0) {
    return {
      success: true,
      data: null,
      message: "this enrollment doesn't have any payment record",
    };
  }
  if (payment.length > 0) {
    return {
      success: true,
      data: payment[0] as ZodSelectPaymentType,
      message: 'Payment details retrived successfully.',
    };
  }
  return {
    success: false,
    message: 'Unkown Error, Contact to adminstrator',
  };
}
/**
 * get payment details and others From id
 */
export async function adminGetPaymentDetailsWithOthersById(paymentId: string) {
  const { user } = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  const payment = await db
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
    .where(eq(paymentsTable.id, paymentId))
    .leftJoin(
      enrollmentsTable,
      eq(paymentsTable.enrollment_id, enrollmentsTable.id)
    )
    .leftJoin(profilesTable, eq(enrollmentsTable.user_id, profilesTable.id))
    .leftJoin(intakeTable, eq(enrollmentsTable.intake_id, intakeTable.id))
    .leftJoin(coursesTable, eq(intakeTable.course_id, coursesTable.id))
    .limit(1);

  if (payment.length === 0) {
    return {
      success: true,
      data: null,
      message: "this enrollment doesn't have any payment record",
    };
  }
  if (payment.length > 0) {
    return {
      success: true,
      data: payment[0] as PaymentDetailsType,
      message: 'Payment details retrived successfully.',
    };
  }
  return {
    success: false,
    message: 'Unkown Error, Contact to adminstrator',
  };
}
/**
 * Delete an intake by ID
 */
export async function adminDeletePayment(id: string) {
  const { user } = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  await db.delete(paymentsTable).where(eq(paymentsTable.id, id));
  revalidatePath('/admin/intakes');
}
export const getCachedAdminPayments = cache(adminGetPayments);
export const getCachedAdminPaymentDetailsByEnrollmentId = cache(
  adminGetPaymentDetailsByEnrollmentId
);
export const getCachedAdminPaymentOnlyDetailsById = cache(
  adminGetPaymentOnlyDetailsById
);
export const getCachedAdminPaymentDetailsWithOthersById = cache(
  adminGetPaymentDetailsWithOthersById
);
