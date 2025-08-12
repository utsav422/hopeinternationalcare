'use server';

import { and, desc, eq, ilike, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import { ZodRefundInsertSchema } from '@/lib/db/drizzle-zod-schema/refunds';
import { enrollments as enrollmentsTable } from '@/lib/db/schema/enrollments';
import { payments as paymentsTable } from '@/lib/db/schema/payments';
import { profiles as profilesTable } from '@/lib/db/schema/profiles';
import { refunds as refundsTable } from '@/lib/db/schema/refunds';
import { requireAdmin } from '@/utils/auth-guard';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export type RefundWithDetails = {
  refundId: string;
  payment_id: string | null;
  reason: string;
  amount: number | string;
  created_at: string | null;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
};

/**
 * Get list of refunds with user info
 */
export async function adminGetRefunds({
  page = 1,
  pageSize = 10,
  search,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
} = {}) {
  try {
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions: ReturnType<typeof ilike>[] = [];

    if (search) {
      whereConditions.push(ilike(profilesTable.full_name, `%${search}%`));
    }

    // TODO: Add status filter when status field is available in refunds table

    const data = await db
      .select({
        refundId: refundsTable.id,
        payment_id: refundsTable.payment_id,
        reason: refundsTable.reason,
        amount: refundsTable.amount,
        created_at: refundsTable.created_at,

        userId: profilesTable.id,
        userEmail: profilesTable.email,
        userName: profilesTable.full_name,
      })
      .from(refundsTable)
      .leftJoin(paymentsTable, eq(refundsTable.payment_id, paymentsTable.id))
      .leftJoin(
        enrollmentsTable,
        eq(paymentsTable.enrollment_id, enrollmentsTable.id)
      )
      .leftJoin(profilesTable, eq(enrollmentsTable.user_id, profilesTable.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(refundsTable.created_at))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(refundsTable)
      .leftJoin(paymentsTable, eq(refundsTable.payment_id, paymentsTable.id))
      .leftJoin(
        enrollmentsTable,
        eq(paymentsTable.enrollment_id, enrollmentsTable.id)
      )
      .leftJoin(profilesTable, eq(enrollmentsTable.user_id, profilesTable.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return {
      success: true,
      data: data as RefundWithDetails[],
      total: totalCountResult[0].count,
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

/**
 * Create and Update Refund status
 */
export async function adminUpsertRefund(refund: TablesInsert<'refunds'>) {
  try {
    await requireAdmin();

    const validatedFields = ZodRefundInsertSchema.safeParse(refund);

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.message,
      };
    }
    // Create/Update Refund status
    const client = await createServerSupabaseClient();

    const { data, error } = await client
      .from('refunds')
      .upsert(
        {
          ...validatedFields.data,
        },
        { onConflict: 'id' }
      )
      .select();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/admin/refunds');
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
export const getCachedAdminRefunds = cache(adminGetRefunds);
