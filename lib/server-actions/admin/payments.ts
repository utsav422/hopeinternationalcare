'use server';

import {type AnyColumn, asc, desc, eq, gte, inArray, like, lte, type SQL, sql,} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {cache} from 'react';
import type {ListParams as DataTableListParams} from '@/hooks/admin/use-data-table-query-state';
import {db} from '@/lib/db/drizzle';
import type {ZodInsertPaymentType} from '@/lib/db/drizzle-zod-schema/payments';
import {
    type PaymentDetailsType,
    ZodPaymentInsertSchema,
    type ZodSelectPaymentType,
} from '@/lib/db/drizzle-zod-schema/payments';
import {courses as coursesTable} from '@/lib/db/schema/courses';
import {enrollments as enrollmentsTable} from '@/lib/db/schema/enrollments';
import type {TypePaymentStatus} from '@/lib/db/schema/enums';
import {intakes as intakeTable} from '@/lib/db/schema/intakes';
import {payments as paymentsTable,} from '@/lib/db/schema/payments';
import {profiles as profilesTable} from '@/lib/db/schema/profiles';
import {requireAdmin} from '@/utils/auth-guard';
import type { Database } from '@/utils/supabase/database.types';
import {ColumnFilter} from "@tanstack/react-table";

/**
 * Get a list of payments with user/course details
 * ListParams = {
 *     page: number
 *     pageSize: number
 *     sortBy: string
 *     order: "asc" | "desc"
 *     filters: ColumnFiltersState
 * }
 */
type PaymentListParams = Partial<DataTableListParams>

export async function adminPaymentList({
                                           page = 1,
                                           pageSize = 10,
                                           sortBy = 'created_at',
                                           order = 'desc',
                                           filters = [],
                                       }: PaymentListParams) {
    try {
        const offset = (page - 1) * pageSize;

        // Define column mapping for sorting and filtering
        const columnMap: Record<string, AnyColumn> = {
            id: paymentsTable.id,
            amount: paymentsTable.amount,
            status: paymentsTable.status,
            paid_at: paymentsTable.paid_at,
            method: paymentsTable.method,
            remarks: paymentsTable.remarks,
            is_refunded: paymentsTable.is_refunded,
            enrolled_at: enrollmentsTable.created_at,
            enrollment_status: enrollmentsTable.status,
            userEmail: profilesTable.email,
            userName: profilesTable.full_name,
            courseTitle: coursesTable.title,
            // Add other columns as needed for filtering/sorting
        };

        // Build filter conditions
        const filterConditions = filters
            ?.map((filter: ColumnFilter) => {
                const col = columnMap[filter.id];
                if (!col) return null; // Skip if column not found

                // Handle string filters (e.g., search by name, email, remarks)
                if (typeof filter.value === 'string' && filter.value !== '') {
                    // Use case-insensitive LIKE for string searches
                    // Adjust the operator based on your needs (e.g., exact match `eq`)
                    return like(col, `%${filter.value}%`);
                }

                // Handle array filters (e.g., status, method)
                if (
                    Array.isArray(filter.value) &&
                    filter.value.length > 0
                    // Optionally restrict to specific columns if needed
                    // && ['status', 'method', 'enrollment_status'].includes(filter.id)
                ) {
                    return inArray(col, filter.value.filter(v => v !== null && v !== undefined));
                }

                // Handle numeric range filters [min, max] (e.g., amount)
                if (
                    Array.isArray(filter.value) &&
                    filter.value.length === 2 &&
                    (typeof filter.value[0] === 'number' || filter.value[0] === null) &&
                    (typeof filter.value[1] === 'number' || filter.value[1] === null)
                ) {
                    const [min, max] = filter.value;
                    const conditions: SQL[] = [];
                    if (min !== null && min !== undefined) {
                        conditions.push(gte(col, min));
                    }
                    if (max !== null && max !== undefined) {
                        conditions.push(lte(col, max));
                    }
                    if (conditions.length > 0) {
                        return sql.join(conditions, sql` AND `);
                    }
                }

                // Handle single numeric value filters (e.g., exact amount match)
                if (typeof filter.value === 'number') {
                    return eq(col, filter.value);
                }

                // Handle boolean filters (e.g., is_refunded)
                if (typeof filter.value === 'boolean') {
                    return eq(col, filter.value);
                }

                // Fallback for other types or empty values
                return null;
            })
            .filter(Boolean) as SQL[]; // Filter out nulls and type assert

        const whereClause =
            filterConditions?.length > 0
                ? sql.join(filterConditions, sql` AND `)
                : undefined;

        // Determine sort column
        const sortColumn: AnyColumn = columnMap[sortBy] || paymentsTable.created_at;
        const sortOrder = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

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

        // Apply filters
        if (whereClause) {
            // @ts-ignore - Dynamic query building
            baseQuery = baseQuery.where(whereClause);
        }

        // Apply sorting, pagination
        // @ts-ignore - Dynamic query building
        const data = await baseQuery
            .orderBy(sortOrder)
            .limit(pageSize)
            .offset(offset);

        // Build count query
        let countQuery = db
            .select({count: sql<number>`count(*)`})
            .from(paymentsTable)
            .leftJoin(
                enrollmentsTable,
                eq(paymentsTable.enrollment_id, enrollmentsTable.id)
            )
            .leftJoin(profilesTable, eq(enrollmentsTable.user_id, profilesTable.id))
            .leftJoin(intakeTable, eq(enrollmentsTable.intake_id, intakeTable.id))
            .leftJoin(coursesTable, eq(intakeTable.course_id, coursesTable.id))
            .$dynamic();

        // Apply filters to count a query
        if (whereClause) {
            // @ts-ignore - Dynamic query building
            countQuery = countQuery.where(whereClause);
        }

        const [{count}] = await countQuery;

        return {success: true, data, total: count ?? 0};
    } catch (error) {
        console.error("Error in adminPaymentList:", error); // Log for debugging
        const e = error as Error;
        return {success: false, error: e.message || 'Failed to fetch payments'};
    }
}

/**
 * Update payment status
 */
export async function adminPaymentUpdateStatusById(
    id: string,
    status: TypePaymentStatus,
    remarks?: string
) {
    try {
        await requireAdmin();

        const data = await db
            .update(paymentsTable)
            .set({status, remarks})
            .where(eq(paymentsTable.id, id))
            .returning();

        revalidatePath('/admin/payments');
        return {success: true, data: data[0]};
    } catch (error) {
        const e = error as Error;
        return {success: false, error: e.message};
    }
}

/**
 * Create or update payment
 */
type PaymentFormInput = ZodInsertPaymentType;

export async function adminPaymentUpsert(input: PaymentFormInput) {
    try {
        await requireAdmin();

        const validatedFields = ZodPaymentInsertSchema.safeParse(input);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.message,
            };
        }
        // Use Drizzle ORM for upsert operation
        const [upsertedData] = await db
            .insert(paymentsTable)
            .values(validatedFields.data)
            .onConflictDoUpdate({
                target: paymentsTable.id,
                set: validatedFields.data,
            })
            .returning();

        revalidatePath('/admin/payments');

        return {
            success: true,
            data: upsertedData,
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
export async function adminPaymentDetailsByEnrollmentId(
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
        return {success: false, error: e.message};
    }
}

/**
 * get payment details From id
 */
export async function adminPaymentDetailsById(paymentId: string) {
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
        return {success: false, error: e.message};
    }
}

/**
 * get payment details and others From id
 */
export async function adminPaymentDetailsWithRelationsById(paymentId: string) {
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
        return {success: false, error: e.message};
    }
}

/**
 * Delete an intake by ID
 */
export async function adminPaymentDeleteById(id: string) {
    try {
        await requireAdmin();

        const data = await db
            .delete(paymentsTable)
            .where(eq(paymentsTable.id, id))
            .returning();
        revalidatePath('/admin/intakes');
        return {success: true, data: data[0]};
    } catch (error) {
        const e = error as Error;
        return {success: false, error: e.message};
    }
}

// Cached versions using React cache
export const cachedAdminPaymentList = cache(adminPaymentList);
export const cachedAdminPaymentDetailsByEnrollmentId = cache(adminPaymentDetailsByEnrollmentId);
export const cachedAdminPaymentDetailsById = cache(adminPaymentDetailsById);
export const cachedAdminPaymentDetailsWithRelationsById = cache(adminPaymentDetailsWithRelationsById);
