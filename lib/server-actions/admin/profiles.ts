// /server-action/admin/profiles.ts
'use server';

import { desc, eq, like, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { db } from '@/lib/db/drizzle';
import type { ZodSelectProfileType } from '@/lib/db/drizzle-zod-schema/profiles';
import { profiles as profilesTable } from '@/lib/db/schema/profiles';
import { requireAdmin } from '@/utils/auth-guard';

type ListParams = Partial<DataTableListParams> & {
  search?: string;
};

/**
 * Get list of all users
 */
export async function adminProfileList({
  page = 1,
  pageSize = 10,
  search = '',
}: ListParams) {
  try {
    const offset = (page - 1) * pageSize;

    let baseQuery = db.select().from(profilesTable).$dynamic();

    if (search) {
      baseQuery = baseQuery.where(like(profilesTable.full_name, `%${search}%`));
    }

    const data = await baseQuery
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(profilesTable.created_at));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profilesTable);

    return { success: true, data, total: count ?? 0 };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

/**
 * Get all users profiles
 */
export async function adminProfileListAll() {
  try {
    const data = await db
      .select()
      .from(profilesTable)
      .orderBy(desc(profilesTable.created_at))
      .where(eq(profilesTable.role, 'authenticated'));

    return { success: true, data };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

/**
 * Get profile by ID
 */
export async function adminProfileDetailsById(id: string) {
  try {
    const [data] = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id));

    if (!data) {
      return { success: false, error: 'Profile not found' };
    }

    return { success: true, data };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

/**
 * Update user role or profile info
 */
export async function adminProfileUpdateById(
  id: string,
  updates: Partial<ZodSelectProfileType>
) {
  try {
    await requireAdmin();

    const data = await db
      .update(profilesTable)
      .set(updates)
      .where(eq(profilesTable.id, id))
      .returning();
    revalidatePath('/admin/users');
    return { success: true, data: data[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
export const cachedAdminProfileList = cache(adminProfileList);
export const cachedAdminProfileListAll = cache(adminProfileListAll);
export const cachedAdminProfileDetailsById = cache(adminProfileDetailsById);
