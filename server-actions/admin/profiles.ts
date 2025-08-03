// /server-action/admin/profiles.ts
'use server';

import { desc, eq, like, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/utils/auth-guard';
import { db } from '@/utils/db/drizzle';
import { profiles as profilesTable } from '@/utils/db/schema/profiles';

type ProfileWithDetails = typeof profilesTable.$inferSelect;

type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

/**
 * Get list of all users
 */
export async function adminGetProfiles({
  page = 1,
  pageSize = 10,
  search = '',
}: ListParams) {
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

  return { data, total: count ?? 0 };
}

/**
 * Get all users profiles
 */
export async function adminGetAllProfiles() {
  const data = await db
    .select()
    .from(profilesTable)
    .orderBy(desc(profilesTable.created_at))
    .where(eq(profilesTable.role, 'authenticated'));

  return { data };
}

/**
 * Get profile by ID
 */
export async function adminGetProfileById(
  id: string
): Promise<ProfileWithDetails> {
  const [data] = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.id, id));

  if (!data) {
    throw new Error('Profile not found');
  }

  return data;
}

/**
 * Update user role or profile info
 */
export async function adminUpdateProfile(
  id: string,
  updates: Partial<ProfileWithDetails>
) {
  const user = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  await db.update(profilesTable).set(updates).where(eq(profilesTable.id, id));
  revalidatePath('/admin/users');
}
