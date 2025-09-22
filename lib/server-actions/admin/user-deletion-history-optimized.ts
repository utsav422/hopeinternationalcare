'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { userDeletionHistory } from '@/lib/db/schema/user-deletion-history';
import { profiles } from '@/lib/db/schema/profiles';
import { authUsers } from 'drizzle-orm/supabase';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/lib/utils/logger';
import {
    UserDeletionHistoryListItem,
    UserDeletionHistoryWithDetails,
    UserDeletionHistoryQueryParams,
    UserDeletionHistoryCreateData,
    UserDeletionHistoryBase
} from '@/lib/types/user-deletion-history';
import { ApiResponse, UserBase } from '@/lib/types';
import {
    validateUserDeletionHistoryData,
    UserDeletionHistoryValidationError
} from '@/lib/utils/user-deletion-history';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import { sendScheduledDeletionWarning, sendRestorationConfirmation } from '@/lib/email/resend';

// Column mappings for user deletion history
const columnMap = {
    id: userDeletionHistory.id,
    user_id: userDeletionHistory.user_id,
    email: authUsers.email,
    name: profiles.full_name,
    deletion_reason: userDeletionHistory.deletion_reason,
    scheduled_deletion_date: userDeletionHistory.scheduled_deletion_date,
    deleted_at: userDeletionHistory.deleted_at,
    created_at: userDeletionHistory.created_at,
};

/**
 * Error handling utility
 */
export function handleUserDeletionHistoryError(error: unknown, operation: string): ApiResponse<never> {
    if (error instanceof UserDeletionHistoryValidationError) {
        return { success: false, error: error.message, code: error.code, details: error.details };
    }
    if (error instanceof Error) {
        logger.error(`User Deletion History ${operation} failed:`, { error: error.message });
        return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
    }
    logger.error(`Unexpected error in user deletion history ${operation}:`, { error: String(error) });
    return { success: false, error: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
}

/**
 * List all user deletion history records.
 */
export async function adminUserDeletionHistoryList(params: UserDeletionHistoryQueryParams): Promise<ApiResponse<{
    data: UserDeletionHistoryListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    try {
        await requireAdmin();
        const { page = 1, pageSize = 10, sortBy = 'created_at', order = 'desc', filters = [], search } = params;

        const filterConditions = buildFilterConditions(filters, columnMap);
        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(sql`(${authUsers.email} ILIKE ${searchFilter} OR ${profiles.full_name} ILIKE ${searchFilter})`);
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, columnMap);

        const query = db
            .select({
                id: userDeletionHistory.id,
                user_id: userDeletionHistory.user_id,
                email: authUsers.email,
                name: profiles.full_name,
                deletion_reason: userDeletionHistory.deletion_reason,
                scheduled_deletion_date: userDeletionHistory.scheduled_deletion_date,
                deleted_at: userDeletionHistory.deleted_at,
                restored_at: userDeletionHistory.restored_at,
                created_at: userDeletionHistory.created_at,
                updated_at: userDeletionHistory.updated_at,
            })
            .from(userDeletionHistory)
            .leftJoin(authUsers, eq(userDeletionHistory.user_id, authUsers.id))
            .leftJoin(profiles, eq(userDeletionHistory.user_id, profiles.id))
            .limit(pageSize)
            .offset((page - 1) * pageSize);

        const queryWithWhere = whereClause ? query.where(whereClause) : query;
        const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;

        const countQuery = db.select({ count: sql<number>`count(*)` }).from(userDeletionHistory).leftJoin(authUsers, eq(userDeletionHistory.user_id, authUsers.id)).leftJoin(profiles, eq(userDeletionHistory.user_id, profiles.id)).where(whereClause);

        const [results, countResult] = await Promise.all([queryWithOrder, countQuery]);

        const data: UserDeletionHistoryListItem[] = results.map(r => ({
            ...r,
            email: r.email || 'N/A',
            name: r.name || 'N/A',
        }));

        return {
            success: true,
            data: {
                data,
                total: countResult[0]?.count || 0,
                page,
                pageSize
            }
        };
    } catch (error) {
        return handleUserDeletionHistoryError(error, 'list');
    }
}

/**
 * Get details of a specific user deletion history record.
 */
export async function adminUserDeletionHistoryDetails(id: string): Promise<ApiResponse<UserDeletionHistoryWithDetails>> {
    try {
        await requireAdmin();
        const deletion = await db.query.userDeletionHistory.findFirst({
            where: eq(userDeletionHistory.id, id),
        });

        if (!deletion) {
            return { success: false, error: 'Record not found', code: 'NOT_FOUND' };
        }

        const userQuery = await db.select().from(authUsers).where(eq(authUsers.id, deletion.user_id)).limit(1);
        const user = userQuery[0] as UserBase | undefined;

        return {
            success: true,
            data: {
                deletion,
                user: user || null
            }
        };
    } catch (error) {
        return handleUserDeletionHistoryError(error, 'details');
    }
}

/**
 * Schedule a user for deletion.
 */
export async function adminUserDeletionHistoryCreate(data: UserDeletionHistoryCreateData): Promise<ApiResponse<UserDeletionHistoryBase>> {
    try {
        await requireAdmin();

        const validation = validateUserDeletionHistoryData(data);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        const userQuery = await db.select().from(authUsers).where(eq(authUsers.id, data.user_id)).limit(1);
        const user = userQuery[0];
        if (!user) return { success: false, error: 'User not found', code: 'NOT_FOUND' };
        if (!user.email) return { success: false, error: 'User email is missing', code: 'BAD_REQUEST' };
        if (!data.scheduled_deletion_date) return { success: false, error: 'Scheduled deletion date is required', code: 'BAD_REQUEST' };

        const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, data.user_id) });

        const [created] = await db.insert(userDeletionHistory).values(data).returning();

        await sendScheduledDeletionWarning(user.email, {
            userName: profile?.full_name || 'User',
            scheduledDate: new Date(data.scheduled_deletion_date).toLocaleDateString(),
            reason: data.deletion_reason,
            contactEmail: 'support@hopeinternational.com.np'
        });

        revalidatePath('/admin/user-deletion-history');
        return { success: true, data: created };
    } catch (error: any) {
        return handleUserDeletionHistoryError(error, 'create');
    }
}

/**
 * Restore a user who was scheduled for deletion.
 */
export async function adminUserDeletionHistoryRestore(id: string): Promise<ApiResponse<UserDeletionHistoryBase>> {
    try {
        await requireAdmin();

        const record = await db.query.userDeletionHistory.findFirst({ where: eq(userDeletionHistory.id, id) });
        if (!record) return { success: false, error: 'Record not found', code: 'NOT_FOUND' };

        const userQuery = await db.select().from(authUsers).where(eq(authUsers.id, record.user_id)).limit(1);
        const user = userQuery[0];
        if (!user?.email) return { success: false, error: 'User email is missing for notification', code: 'BAD_REQUEST' };

        const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, record.user_id) });

        const [updated] = await db.update(userDeletionHistory).set({
            restored_at: new Date().toISOString(),
            restoration_count: (record.restoration_count || 0) + 1,
            updated_at: sql`now()`
        }).where(eq(userDeletionHistory.id, id)).returning();

        await sendRestorationConfirmation(user.email, {
            userName: profile?.full_name || 'User',
            restorationDate: new Date().toLocaleDateString(),
            contactEmail: 'support@hopeinternational.com.np'
        });

        revalidatePath('/admin/user-deletion-history');
        revalidatePath(`/admin/user-deletion-history/${id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        return handleUserDeletionHistoryError(error, 'restore');
    }
}