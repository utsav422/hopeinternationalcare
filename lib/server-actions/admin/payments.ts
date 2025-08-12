'use server';

import { desc, eq, like, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { db } from '@/lib/db/drizzle';
import {
  type PaymentDetailsType,
  ZodPaymentInsertSchema,
  type ZodSelectPaymentType,
} from '@/lib/db/drizzle-zod-schema/payments';
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
import type { TablesInsert } from '@/utils/supabase/database.types';
import { createServerSupabaseClient } from '@/utils/supabase/server';

/**
 * Get list of payments with user/course details
 */
type PaymentListParams = Partial<DataTableListParams> & {
  search?: string;
  status?: TypePaymentStatus;
};
export async function adminGetPayments({
  page = 1,
  pageSize = 10,
  search = '',
  status,
}: PaymentListParams) {
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
    return { success: true, data, total: count ?? 0 };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

/**
 * Update payment status
 */
export async function adminUpdatePaymentStatus(
  id: string,
  status: TypePaymentStatus,
  remarks?: string
) {
  try {
    await requireAdmin();

    const data = await db
      .update(paymentsTable)
      .set({ status, remarks })
      .where(eq(paymentsTable.id, id))
      .returning();

    revalidatePath('/admin/payments');
    return { success: true, data: data[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

/**
 * Create or update payment
 */
type PaymentFormInput = TablesInsert<'payments'>;
export async function adminUpsertPayment(input: PaymentFormInput) {
  try {
    await requireAdmin();

    const validatedFields = ZodPaymentInsertSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.message,
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
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/payments');

    return {
      success: true,
      data,
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      error: e.message,
    };
  }
}

/**
 * get payment details From enrolment_id
 */
export async function adminGetPaymentDetailsByEnrollmentId(
  enrollmentId: string
) {
  try {
    await requireAdmin();

    const payment = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.enrollment_id, enrollmentId))
      .limit(1);

    if (payment.length === 0) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: payment[0] as ZodSelectPaymentType,
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
/**
 * get payment details From id
 */
export async function adminGetPaymentOnlyDetailsById(paymentId: string) {
  try {
    await requireAdmin();

    const payment = await db
      .select()

      .from(paymentsTable)
      .where(eq(paymentsTable.id, paymentId))

      .limit(1);

    if (payment.length === 0) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: payment[0] as ZodSelectPaymentType,
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
/**
 * get payment details and others From id
 */
export async function adminGetPaymentDetailsWithOthersById(paymentId: string) {
  try {
    await requireAdmin();

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
      };
    }

    return {
      success: true,
      data: payment[0] as PaymentDetailsType,
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
/**
 * Delete an intake by ID
 */
export async function adminDeletePayment(id: string) {
  try {
    await requireAdmin();

    const data = await db
      .delete(paymentsTable)
      .where(eq(paymentsTable.id, id))
      .returning();
    revalidatePath('/admin/intakes');
    return { success: true, data: data[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
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
