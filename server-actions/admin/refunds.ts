'use server';

import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { requireAdmin } from '@/utils/auth-guard';
import { db } from '@/utils/db/drizzle';
import { ZodRefundInsertSchema } from '@/utils/db/drizzle-zod-schema/refunds';
import { payments as paymentsTable } from '@/utils/db/schema/payments';
import { profiles as profilesTable } from '@/utils/db/schema/profiles';
import { refunds as refundsTable } from '@/utils/db/schema/refunds';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { createServerSupabaseClient } from '@/utils/supabase/server';

type RefundWithDetails = {
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
export async function adminGetRefunds() {
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
    .leftJoin(profilesTable, eq(paymentsTable.enrollment_id, profilesTable.id))
    .orderBy(desc(refundsTable.created_at));

  return data as RefundWithDetails[];
}

/**
 * Create and Update Refund status
 */
export async function adminUpsertRefund(refund: TablesInsert<'refunds'>) {
  await requireAdmin();

  const validatedFields = ZodRefundInsertSchema.safeParse(refund);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.message,
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
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath('/admin/refunds');
  return {
    data,
    success: true,
    message: refund.id
      ? 'Refund updated successfully'
      : 'Refund created successfully',
  };
}
export const getCachedAdminRefunds = cache(adminGetRefunds);
