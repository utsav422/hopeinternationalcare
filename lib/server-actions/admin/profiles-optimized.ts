'use server';

import { and, eq, sql, count, sum } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { profiles } from '@/lib/db/schema/profiles';
import { enrollments } from '@/lib/db/schema/enrollments';
import { payments } from '@/lib/db/schema/payments';
import { authUsers } from 'drizzle-orm/supabase';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/lib/utils/logger';
import {
    ProfileListItem,
    ProfileWithDetails,
    ProfileQueryParams,
    ProfileCreateData,
    ProfileUpdateData,
    ProfileBase,
} from '@/lib/types/profiles';
import { ApiResponse, UserBase } from '@/lib/types';
import {
    validateProfileData,
    ProfileValidationError,
    checkProfileConstraints,
} from '@/lib/utils/profiles';
import {
    buildFilterConditions,
    buildWhereClause,
    buildOrderByClause,
} from '@/lib/utils/query-utils';
import { createAdminSupabaseClient } from '@/utils/supabase/admin';

// Column mappings for profiles
const columnMap = {
    id: profiles.id,
    full_name: profiles.full_name,
    email: profiles.email,
    phone: profiles.phone,
    role: profiles.role,
    created_at: profiles.created_at,
};

/**
 * Error handling utility
 */
export async function handleProfileError(
    error: unknown,
    operation: string
): Promise<ApiResponse<never>> {
    if (error instanceof ProfileValidationError) {
        return Promise.reject({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
        });
    }
    if (error instanceof Error) {
        logger.error(`Profile ${operation} failed:`, { error: error.message });
        return Promise.reject({
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR',
        });
    }
    logger.error(`Unexpected error in profile ${operation}:`, {
        error: String(error),
    });
    return Promise.reject({
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    });
}

/**
 * List all profiles with aggregated data.
 */
export async function adminProfileList(params: ProfileQueryParams): Promise<
    ApiResponse<{
        data: ProfileListItem[];
        total: number;
        page?: number;
        pageSize?: number;
    }>
> {
    try {
        await requireAdmin();
        const {
            page,
            pageSize,
            sortBy = 'created_at',
            order = 'desc',
            filters = [],
            search,
        } = params;

        const filterConditions = buildFilterConditions(filters, columnMap);
        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(
                sql`(${profiles.full_name} ILIKE ${searchFilter} OR ${profiles.email} ILIKE ${searchFilter})`
            );
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, columnMap);
        console.log('whereClause:', whereClause);
        console.log('orderBy:', orderBy);
        const query = db
            .select({
                id: profiles.id,
                full_name: profiles.full_name,
                email: profiles.email,
                phone: profiles.phone,
                created_at: profiles.created_at,
                updated_at: profiles.updated_at,
                enrollment_count:
                    sql<number>`count(distinct ${enrollments.id})`.mapWith(
                        Number
                    ),
                total_payments:
                    sql<number>`coalesce(sum(${payments.amount}), 0)`.mapWith(
                        Number
                    ),
            })
            .from(profiles)
            .leftJoin(enrollments, eq(profiles.id, enrollments.user_id))
            .leftJoin(payments, eq(enrollments.id, payments.enrollment_id))
            .groupBy(profiles.id);
        if (page && pageSize) {
            query.limit(pageSize).offset((page - 1) * pageSize);
        }

        const queryWithWhere = whereClause ? query.where(whereClause) : query;
        const queryWithOrder = orderBy
            ? queryWithWhere.orderBy(orderBy)
            : queryWithWhere;

        const countQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(profiles)
            .where(whereClause);

        const [results, countResult] = await Promise.all([
            queryWithOrder,
            countQuery,
        ]);

        return {
            success: true,
            data: {
                data: results as any as ProfileListItem[],
                total: countResult[0]?.count || 0,
                page,
                pageSize,
            },
        };
    } catch (error) {
        return handleProfileError(error, 'list');
    }
}

/**
 * Get details of a specific profile, including related user, enrollments, and payments.
 */
export async function adminProfileDetails(
    id: string
): Promise<ApiResponse<ProfileWithDetails>> {
    try {
        await requireAdmin();
        const profileData = await db.query.profiles.findFirst({
            where: eq(profiles.id, id),
            with: {
                enrollments: {
                    with: {
                        payments: true,
                    },
                },
            },
        });

        if (!profileData) {
            return {
                success: false,
                error: 'Profile not found',
                code: 'NOT_FOUND',
            };
        }

        const userQuery = await db
            .select()
            .from(authUsers)
            .where(eq(authUsers.id, profileData.id))
            .limit(1);
        const authUser = userQuery[0] as UserBase | undefined;

        const { enrollments, ...profile } = profileData;
        const allPayments = enrollments.flatMap(e => e.payments);

        return {
            success: true,
            data: {
                profile,
                user: authUser || null,
                enrollments: enrollments || [],
                payments: allPayments || [],
            },
        };
    } catch (error) {
        return handleProfileError(error, 'details');
    }
}

/**
 * Create a new profile for an existing auth user.
 */
export async function adminProfileCreate(
    data: ProfileCreateData
): Promise<ApiResponse<ProfileBase>> {
    try {
        await requireAdmin();

        const validation = validateProfileData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details,
            };
        }

        const [created] = await db.insert(profiles).values(data).returning();

        revalidatePath('/admin/profiles');
        return { success: true, data: created };
    } catch (error: any) {
        return handleProfileError(error, 'create');
    }
}

export async function adminProfileCheckConstraints(
    id: string
): Promise<ApiResponse<{ canDelete: boolean }>> {
    try {
        await requireAdmin();
        const result = await checkProfileConstraints(id);

        return {
            success: true,
            data: {
                canDelete: result.canDelete,
            },
        };
    } catch (error) {
        return handleProfileError(error, 'constraint-check');
    }
}

/**
 * Update an existing profile.
 */
export async function adminProfileUpdate(
    data: ProfileUpdateData
): Promise<ApiResponse<ProfileBase>> {
    try {
        await requireAdmin();

        const validation = validateProfileData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details,
            };
        }

        const { id, ...updateData } = data;

        const [updated] = await db
            .update(profiles)
            .set({ ...updateData, updated_at: sql`now()` })
            .where(eq(profiles.id, id))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Profile not found',
                code: 'NOT_FOUND',
            };
        }

        revalidatePath('/admin/profiles');
        revalidatePath(`/admin/profiles/${id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        return handleProfileError(error, 'update');
    }
}

/**
 * Delete a profile and its corresponding auth user.
 */
export async function adminProfileDelete(
    id: string
): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();
        const supabase = createAdminSupabaseClient();

        // Using a transaction to ensure both profile and auth user are deleted.
        await db.transaction(async tx => {
            await tx.delete(profiles).where(eq(profiles.id, id));
            const { error } = await supabase.auth.admin.deleteUser(id);
            if (error) {
                // If Supabase user deletion fails, roll back the profile deletion.
                tx.rollback();
                throw new Error(`Failed to delete auth user: ${error.message}`);
            }
        });

        revalidatePath('/admin/profiles');
        return { success: true };
    } catch (error) {
        return handleProfileError(error, 'delete');
    }
}
