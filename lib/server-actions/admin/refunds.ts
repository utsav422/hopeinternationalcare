'use server';

import {and, AnyColumn, asc, desc, eq, gte, ilike, inArray, lte, sql, SQL} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import {cache} from 'react';
import {db} from '@/lib/db/drizzle';
import type {ZodInsertRefundType} from '@/lib/db/drizzle-zod-schema/refunds';
import {ZodRefundInsertSchema} from '@/lib/db/drizzle-zod-schema/refunds';
import {enrollments as enrollmentsTable} from '@/lib/db/schema/enrollments';
import {payments as paymentsTable} from '@/lib/db/schema/payments';
import {profiles as profilesTable} from '@/lib/db/schema/profiles';
import {refunds as refundsTable} from '@/lib/db/schema/refunds';
import {requireAdmin} from '@/utils/auth-guard';
import type { Database } from '@/utils/supabase/database.types';
import type {ListParams as DataTableListParams} from "@/hooks/admin/use-data-table-query-state";
import {ColumnFilter} from '@tanstack/react-table';

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
 * Get a list of refunds with user info
 */
type RefundListParams = Partial<DataTableListParams>

export async function adminRefundList({
                                          page = 1,
                                          pageSize = 10,
                                          sortBy = 'created_at',
                                          order = 'desc',
                                          filters = [],
                                      }: RefundListParams) {
    try {
        const offset = (page - 1) * pageSize;

        // Define column mapping for sorting and filtering
        const columnMap: Record<string, AnyColumn> = {
            refundId: refundsTable.id,
            payment_id: refundsTable.payment_id,
            reason: refundsTable.reason,
            amount: refundsTable.amount,
            created_at: refundsTable.created_at,
            userId: profilesTable.id,
            userEmail: profilesTable.email,
            userName: profilesTable.full_name,
            // Add other columns as needed for filtering/sorting
        };

        // Build filter conditions using the same pattern as adminPaymentList
        const filterConditions = filters
            ?.map((filter: ColumnFilter) => {
                const col = columnMap[filter.id];
                if (!col) return null;

                // Handle string filters (e.g., search by name, email, reason)
                if (typeof filter.value === 'string' && filter.value !== '') {
                    return ilike(col, `%${filter.value}%`); // Using ilike for case-insensitive search
                }

                // Handle array filters (if any specific columns need this, e.g., hypothetical status)
                if (
                    Array.isArray(filter.value) &&
                    filter.value.length > 0
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

                // Handle boolean filters (if any boolean fields exist)
                if (typeof filter.value === 'boolean') {
                    return eq(col, filter.value);
                }

                // Fallback for other types or empty values
                return null;
            })
            .filter(Boolean) as SQL[]; // Filter out nulls and type assert

        const whereClause =
            filterConditions?.length > 0
                ? and(...filterConditions) // Combine filter conditions with AND
                : undefined;

        // Determine sort column
        const sortColumn: AnyColumn = columnMap[sortBy] || refundsTable.created_at;
        const sortOrder = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

        // Build data query
        const dataQuery = db
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
            .$dynamic(); // Allow dynamic query building

        // Apply filters
        // @ts-ignore - Dynamic query building
        const data = await dataQuery
            .where(whereClause)
            .orderBy(sortOrder)
            .limit(pageSize)
            .offset(offset);

        // Build count query
        const countQuery = db
            .select({count: sql<number>`count(*)`})
            .from(refundsTable)
            .leftJoin(paymentsTable, eq(refundsTable.payment_id, paymentsTable.id))
            .leftJoin(
                enrollmentsTable,
                eq(paymentsTable.enrollment_id, enrollmentsTable.id)
            )
            .leftJoin(profilesTable, eq(enrollmentsTable.user_id, profilesTable.id))
            .$dynamic(); // Allow dynamic query building

        // Apply filters to count query
        // @ts-ignore - Dynamic query building
        const totalCountResult = await countQuery
            .where(whereClause);

        return {
            success: true,
            data: data as RefundWithDetails[],
            total: totalCountResult[0].count,
        };
    } catch (error) {
        console.error("Error in adminRefundList:", error);
        const e = error as Error;
        return {success: false, error: e.message || 'Failed to fetch refunds'};
    }
}

/**
 * Create and Update Refund status
 */
export async function adminRefundUpsert(refund: ZodInsertRefundType) {
    try {
        await requireAdmin();

        const validatedFields = ZodRefundInsertSchema.safeParse(refund);

        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.message,
            };
        }
        // Use Drizzle ORM for upsert operation
        const [upsertedData] = await db
            .insert(refundsTable)
            .values(validatedFields.data)
            .onConflictDoUpdate({
                target: refundsTable.id,
                set: validatedFields.data,
            })
            .returning();

        revalidatePath('/admin/refunds');
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

export const cachedAdminRefundList = cache(adminRefundList);
