'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { refunds } from '@/lib/db/schema/refunds';
import { payments } from '@/lib/db/schema/payments';
import { enrollments } from '@/lib/db/schema/enrollments';
import { profiles } from '@/lib/db/schema/profiles';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/lib/utils/logger';
import {
    RefundListItem,
    RefundWithDetails,
    RefundQueryParams,
    RefundCreateData,
    RefundBase
} from '@/lib/types/refunds';
import { ApiResponse } from '@/lib/types';
import {
    validateRefundData,
    RefundValidationError
} from '@/lib/utils/refunds';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import { calculateRefundableAmount } from '@/lib/utils/payments';

// Column mappings for refunds
const refundColumnMap = {
    id: refunds.id,
    payment_id: refunds.payment_id,
    amount: refunds.amount,
    reason: refunds.reason,
    created_at: refunds.created_at,
    user_name: profiles.full_name,
    user_email: profiles.email,
};

/**
 * Error handling utility
 */
export function handleRefundError(error: unknown, operation: string): ApiResponse<never> {
    if (error instanceof RefundValidationError) {
        return { success: false, error: error.message, code: error.code, details: error.details };
    }
    if (error instanceof Error) {
        logger.error(`Refund ${operation} failed:`, { error: error.message });
        return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
    }
    logger.error(`Unexpected error in refund ${operation}:`, { error: String(error) });
    return { success: false, error: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
}

/**
 * List all refund records.
 */
export async function adminRefundList(params: RefundQueryParams): Promise<ApiResponse<{
    data: RefundListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    try {
        await requireAdmin();
        const { page = 1, pageSize = 10, sortBy = 'created_at', order = 'desc', filters = [], search } = params;

        const filterConditions = buildFilterConditions(filters, refundColumnMap);
        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(sql`(${refunds.reason} ILIKE ${searchFilter} OR ${profiles.full_name} ILIKE ${searchFilter} OR ${profiles.email} ILIKE ${searchFilter})`);
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, refundColumnMap);

        const query = db
            .select({
                id: refunds.id,
                payment_id: refunds.payment_id,
                amount: refunds.amount,
                reason: refunds.reason,
                created_at: refunds.created_at,
                updated_at: refunds.updated_at,
                payment: { id: payments.id },
                user: { id: profiles.id, full_name: profiles.full_name, email: profiles.email },
            })
            .from(refunds)
            .leftJoin(payments, eq(refunds.payment_id, payments.id))
            .leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id))
            .leftJoin(profiles, eq(enrollments.user_id, profiles.id))
            .limit(pageSize)
            .offset((page - 1) * pageSize);

        const queryWithWhere = whereClause ? query.where(whereClause) : query;
        const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;

        const countQuery = db.select({ count: sql<number>`count(*)` }).from(refunds).leftJoin(profiles, eq(refunds.user_id, profiles.id)).where(whereClause);

        const [results, countResult] = await Promise.all([queryWithOrder, countQuery]);

        const data: RefundListItem[] = results.map(r => ({
            ...r,
            payment: r.payment ? r.payment : null,
            user: r.user ? r.user : null,
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
        return handleRefundError(error, 'list');
    }
}

/**
 * Get details of a specific refund record.
 */
export async function adminRefundDetails(id: string): Promise<ApiResponse<RefundWithDetails>> {
    try {
        await requireAdmin();
        const data = await db.query.refunds.findFirst({
            where: eq(refunds.id, id),
            with: {
                payment: true,
                user: true
            }
        });

        if (!data) {
            return { success: false, error: 'Refund record not found', code: 'NOT_FOUND' };
        }

        const { user, payment, ...refund } = data;

        return {
            success: true,
            data: {
                refund,
                payment: payment || null,
                user: user || null
            }
        };
    } catch (error) {
        return handleRefundError(error, 'details');
    }
}

/**
 * Create a refund and update the associated payment.
 */
export async function adminRefundCreate(data: RefundCreateData): Promise<ApiResponse<RefundBase>> {
    try {
        await requireAdmin();

        const validation = validateRefundData(data);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        if (!data.payment_id) {
            return { success: false, error: 'Payment ID is required for a refund', code: 'VALIDATION_ERROR' };
        }

        const createdRefund = await db.transaction(async (tx) => {
            const payment = await tx.query.payments.findFirst({ where: eq(payments.id, data.payment_id!) });

            if (!payment) {
                tx.rollback();
                return { error: 'Payment not found', code: 'NOT_FOUND' };
            }

            if (payment.status !== 'completed') {
                tx.rollback();
                return { error: 'Only completed payments can be refunded', code: 'INVALID_PAYMENT_STATUS' };
            }

            const refundedAmount = payment.refunded_amount || 0;
            const refundableAmount = calculateRefundableAmount(payment.amount, refundedAmount);

            if (data.amount > refundableAmount) {
                tx.rollback();
                return { error: `Refund amount cannot exceed the refundable amount of ${refundableAmount}` , code: 'VALIDATION_ERROR' };
            }

            const [newRefund] = await tx.insert(refunds).values(data).returning();

            const newRefundedAmount = refundedAmount + data.amount;
            const newPaymentStatus = newRefundedAmount >= payment.amount ? 'refunded' : payment.status;

            await tx.update(payments).set({
                refunded_amount: newRefundedAmount,
                is_refunded: true,
                refunded_at: new Date().toISOString(),
                status: newPaymentStatus,
                updated_at: sql`now()`
            }).where(eq(payments.id, data.payment_id!));

            return newRefund;
        });

        if (createdRefund && 'error' in createdRefund) {
            return { success: false, error: createdRefund.error, code: createdRefund.code };
        }

        revalidatePath('/admin/refunds');
        revalidatePath(`/admin/payments/${data.payment_id}`);
        return { success: true, data: createdRefund };

    } catch (error: any) {
        return handleRefundError(error, 'create');
    }
}