'use server';

import { and, desc, eq, gte, ilike, isNull, lte, or, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { profiles, userDeletionHistory } from '@/lib/db/schema';
import {
    ZodCancelScheduledDeletionSchema,
    ZodDeletedUsersQuerySchema,
    ZodUserDeletionHistoryQuerySchema,
    ZodUserDeletionSchema,
    ZodUserRestorationSchema,
    type ZodDeletedUsersQueryType,
} from '@/lib/db/drizzle-zod-schema';
import { sendUserDeletionNotification, sendScheduledDeletionWarning, sendRestorationConfirmation } from '@/lib/email/resend';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/utils/logger';

const MAX_USER_RESTORATIONS = parseInt(process.env.MAX_USER_RESTORATIONS || '3');

export async function softDeleteUserAction(formData: FormData) {
    try {
        const adminUser = await requireAdmin();

        const rawData = {
            user_id: formData.get('user_id')?.toString(),
            deletion_reason: formData.get('deletion_reason')?.toString(),
            scheduled_deletion_date: formData.get('scheduled_deletion_date')?.toString(),
            send_email_notification: formData.get('send_email_notification') === 'true',
        };

        const parsed = ZodUserDeletionSchema.safeParse(rawData);
        if (!parsed.success) {
            return {
                success: false,
                message: 'Invalid input data',
                errors: parsed.error.issues,
            };
        }

        const { user_id, deletion_reason, scheduled_deletion_date, send_email_notification } = parsed.data;

        // Prevent self-deletion
        if (user_id === adminUser.user.id) {
            return {
                success: false,
                message: 'You cannot delete your own account',
            };
        }

        // Check if user exists and is not already deleted
        const existingUser = await db
            .select()
            .from(profiles)
            .where(and(eq(profiles.id, user_id), isNull(profiles.deleted_at)))
            .limit(1);

        if (existingUser.length === 0) {
            return {
                success: false,
                message: 'User not found or already deleted',
            };
        }

        const user = existingUser[0];
        const now = new Date().toISOString();
        const deletionDate = scheduled_deletion_date || now;
        const isScheduled = scheduled_deletion_date && new Date(scheduled_deletion_date) > new Date();

        // Start transaction
        await db.transaction(async (tx) => {
            // Update user profile with deletion info
            if (isScheduled) {
                await tx
                    .update(profiles)
                    .set({
                        deletion_scheduled_for: deletionDate,
                        updated_at: now,
                    })
                    .where(eq(profiles.id, user_id));
            } else {
                await tx
                    .update(profiles)
                    .set({
                        deleted_at: now,
                        deletion_count: sql`${profiles.deletion_count} + 1`,
                        updated_at: now,
                    })
                    .where(eq(profiles.id, user_id));
            }

            // Create audit trail entry
            await tx.insert(userDeletionHistory).values({
                user_id,
                deleted_at: now,
                deleted_by: adminUser.user.id,
                deletion_reason,
                scheduled_deletion_date: isScheduled ? deletionDate : null,
                email_notification_sent: false,
            });
        });

        // Send email notification if requested
        if (send_email_notification) {
            try {
                if (isScheduled) {
                    await sendScheduledDeletionWarning(user.email, {
                        userName: user.full_name,
                        scheduledDate: new Date(deletionDate).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }),
                        reason: deletion_reason,
                        contactEmail: 'info@hopeinternational.com.np',
                    });
                } else {
                    await sendUserDeletionNotification(user.email, {
                        userName: user.full_name,
                        deletionDate: new Date(now).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }),
                        reason: deletion_reason,
                        contactEmail: 'info@hopeinternational.com.np',
                    });
                }

                // Update email notification status
                await db
                    .update(userDeletionHistory)
                    .set({ email_notification_sent: true })
                    .where(and(
                        eq(userDeletionHistory.user_id, user_id),
                        eq(userDeletionHistory.deleted_by, adminUser.user.id)
                    ));
            } catch (emailError) {
                logger.error('Failed to send deletion notification email', { error: emailError, user_id });
            }
        }

        revalidatePath('/admin/users');
        revalidatePath('/admin/users/deleted');

        return {
            success: true,
            message: isScheduled
                ? `User deletion scheduled for ${new Date(deletionDate).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' })}`
                : 'User deleted successfully',
            data: { user_id, isScheduled },
        };
    } catch (error) {
        logger.error('Error in softDeleteUserAction', { error });
        return {
            success: false,
            message: 'Failed to delete user. Please try again.',
        };
    }
}

export async function restoreUserAction(formData: FormData) {
    try {
        const adminUser = await requireAdmin();

        const rawData = {
            user_id: formData.get('user_id')?.toString(),
            restoration_reason: formData.get('restoration_reason')?.toString(),
        };

        const parsed = ZodUserRestorationSchema.safeParse(rawData);
        if (!parsed.success) {
            return {
                success: false,
                message: 'Invalid input data',
                errors: parsed.error.issues,
            };
        }

        const { user_id, restoration_reason } = parsed.data;

        // Check if user exists and is deleted
        const existingUser = await db
            .select()
            .from(profiles)
            .where(eq(profiles.id, user_id))
            .limit(1);

        if (existingUser.length === 0) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        const user = existingUser[0];

        if (!user.deleted_at) {
            return {
                success: false,
                message: 'User is not deleted',
            };
        }

        // Check restoration limit
        if (user.deletion_count >= MAX_USER_RESTORATIONS) {
            return {
                success: false,
                message: `User has reached the maximum restoration limit of ${MAX_USER_RESTORATIONS}`,
            };
        }

        const now = new Date().toISOString();

        // Start transaction
        await db.transaction(async (tx) => {
            // Restore user profile
            await tx
                .update(profiles)
                .set({
                    deleted_at: null,
                    deletion_scheduled_for: null,
                    updated_at: now,
                })
                .where(eq(profiles.id, user_id));

            // Update the latest deletion history entry
            await tx
                .update(userDeletionHistory)
                .set({
                    restored_at: now,
                    restored_by: adminUser.user.id,
                    restoration_count: sql`${userDeletionHistory.restoration_count} + 1`,
                    updated_at: now,
                })
                .where(and(
                    eq(userDeletionHistory.user_id, user_id),
                    isNull(userDeletionHistory.restored_at)
                ));
        });

        // Send restoration confirmation email
        try {
            await sendRestorationConfirmation(user.email, {
                userName: user.full_name,
                restorationDate: new Date(now).toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }),
                contactEmail: 'info@hopeinternational.com.np',
            });
        } catch (emailError) {
            logger.error('Failed to send restoration confirmation email', { error: emailError, user_id });
        }

        revalidatePath('/admin/users');
        revalidatePath('/admin/users/deleted');

        return {
            success: true,
            message: 'User restored successfully',
            data: { user_id },
        };
    } catch (error) {
        logger.error('Error in restoreUserAction', { error });
        return {
            success: false,
            message: 'Failed to restore user. Please try again.',
        };
    }
}

// Type for Next.js searchParams (compatible with both URLSearchParams and Next.js searchParams)
export type NextJSSearchParams = Record<string, string | string[] | undefined>;
export type SearchParamsInput = URLSearchParams | NextJSSearchParams;

// Utility function to normalize search params to a plain object
function normalizeSearchParams(searchParams: SearchParamsInput): Record<string, any> {
    if (searchParams instanceof URLSearchParams) {
        return Object.fromEntries(searchParams.entries());
    } else {
        // Convert searchParams object to the format expected by Zod
        const rawParams: Record<string, any> = {};
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined) {
                // Handle array values by taking the first element
                rawParams[key] = Array.isArray(value) ? value[0] : value;
            }
        });
        return rawParams;
    }
}

export async function getDeletedUsersAction(searchParams: SearchParamsInput) {
    try {
        await requireAdmin();

        // Normalize search params to a plain object
        const rawParams = normalizeSearchParams(searchParams);
        const parsed = ZodDeletedUsersQuerySchema.safeParse(rawParams);

        if (!parsed.success) {
            return {
                success: false,
                message: 'Invalid query parameters',
                errors: parsed.error.issues,
            };
        }

        const { page, pageSize, sortBy, order, search, deleted_by, date_from, date_to } = parsed.data;
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const whereConditions = [sql`${profiles.deleted_at} IS NOT NULL`];

        if (search) {
            whereConditions.push(
                or(
                    ilike(profiles.full_name, `%${search}%`),
                    ilike(profiles.email, `%${search}%`)
                )!
            );
        }

        if (date_from) {
            whereConditions.push(gte(profiles.deleted_at, date_from));
        }

        if (date_to) {
            whereConditions.push(lte(profiles.deleted_at, date_to));
        }

        if (deleted_by) {
            whereConditions.push(eq(userDeletionHistory.deleted_by, deleted_by));
        }

        // Get deleted users with deletion history
        const deletedUsers = await db
            .select({
                id: profiles.id,
                full_name: profiles.full_name,
                email: profiles.email,
                phone: profiles.phone,
                role: profiles.role,
                deleted_at: profiles.deleted_at,
                deletion_scheduled_for: profiles.deletion_scheduled_for,
                deletion_count: profiles.deletion_count,
                created_at: profiles.created_at,
                deletion_reason: userDeletionHistory.deletion_reason,
                deleted_by: userDeletionHistory.deleted_by,
                email_notification_sent: userDeletionHistory.email_notification_sent,
            })
            .from(profiles)
            .leftJoin(
                userDeletionHistory,
                and(
                    eq(profiles.id, userDeletionHistory.user_id),
                    isNull(userDeletionHistory.restored_at)
                )
            )
            .where(and(...whereConditions))
            .orderBy(order === 'desc' ? desc(profiles[sortBy]) : profiles[sortBy])
            .limit(pageSize)
            .offset(offset);

        // Get total count
        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(profiles)
            .where(and(...whereConditions));

        const total = totalResult[0]?.count || 0;

        return {
            success: true,
            message: 'Deleted users retrieved successfully',
            data: {
                users: deletedUsers,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages: Math.ceil(total / pageSize),
                },
            },
        };
    } catch (error) {
        logger.error('Error in getDeletedUsersAction', { error });
        return {
            success: false,
            message: 'Failed to retrieve deleted users',
        };
    }
}

export async function getUserDeletionHistoryAction(userId: string) {
    try {
        await requireAdmin();

        const parsed = ZodUserDeletionHistoryQuerySchema.safeParse({ user_id: userId });
        if (!parsed.success) {
            return {
                success: false,
                message: 'Invalid user ID',
                errors: parsed.error.issues,
            };
        }

        const history = await db
            .select({
                id: userDeletionHistory.id,
                deleted_at: userDeletionHistory.deleted_at,
                deleted_by: userDeletionHistory.deleted_by,
                restored_at: userDeletionHistory.restored_at,
                restored_by: userDeletionHistory.restored_by,
                deletion_reason: userDeletionHistory.deletion_reason,
                scheduled_deletion_date: userDeletionHistory.scheduled_deletion_date,
                email_notification_sent: userDeletionHistory.email_notification_sent,
                restoration_count: userDeletionHistory.restoration_count,
                created_at: userDeletionHistory.created_at,
            })
            .from(userDeletionHistory)
            .where(eq(userDeletionHistory.user_id, userId))
            .orderBy(desc(userDeletionHistory.created_at));

        return {
            success: true,
            message: 'User deletion history retrieved successfully',
            data: { history },
        };
    } catch (error) {
        logger.error('Error in getUserDeletionHistoryAction', { error });
        return {
            success: false,
            message: 'Failed to retrieve user deletion history',
        };
    }
}

export async function cancelScheduledDeletionAction(formData: FormData) {
    try {
        await requireAdmin();

        const rawData = {
            user_id: formData.get('user_id')?.toString(),
        };

        const parsed = ZodCancelScheduledDeletionSchema.safeParse(rawData);
        if (!parsed.success) {
            return {
                success: false,
                message: 'Invalid user ID',
                errors: parsed.error.issues,
            };
        }

        const { user_id } = parsed.data;

        // Check if user has scheduled deletion
        const user = await db
            .select()
            .from(profiles)
            .where(and(
                eq(profiles.id, user_id),
                isNull(profiles.deleted_at),
                sql`${profiles.deletion_scheduled_for} IS NOT NULL`
            ))
            .limit(1);

        if (user.length === 0) {
            return {
                success: false,
                message: 'User not found or does not have scheduled deletion',
            };
        }

        const now = new Date().toISOString();

        // Cancel scheduled deletion
        await db
            .update(profiles)
            .set({
                deletion_scheduled_for: null,
                updated_at: now,
            })
            .where(eq(profiles.id, user_id));

        revalidatePath('/admin/users');
        revalidatePath('/admin/users/deleted');

        return {
            success: true,
            message: 'Scheduled deletion cancelled successfully',
            data: { user_id },
        };
    } catch (error) {
        logger.error('Error in cancelScheduledDeletionAction', { error });
        return {
            success: false,
            message: 'Failed to cancel scheduled deletion',
        };
    }
}
