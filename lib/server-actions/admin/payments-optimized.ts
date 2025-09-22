'use server';

import { ApiResponse } from '@/lib/types';
import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { payments } from '@/lib/db/schema/payments';
import { enrollments } from '@/lib/db/schema/enrollments';
import { profiles } from '@/lib/db/schema/profiles';
import { courses } from '@/lib/db/schema/courses';
import { intakes } from '@/lib/db/schema/intakes';
import { refunds } from '@/lib/db/schema/refunds';
import { requireAdmin } from '@/utils/auth-guard';

import { logger } from '@/lib/utils/logger';
import {
    PaymentListItem,
    PaymentWithDetails,
    PaymentQueryParams,
    PaymentCreateData,
    PaymentUpdateData,
    PaymentConstraintCheck, PaymentStatusUpdate,
    PaymentRefundData,
    PaymentBase
} from '@/lib/types/payments';
import {
    validatePaymentData,
    checkPaymentConstraints,
    PaymentValidationError,
    canUpdatePaymentStatus,
    validateRefundData,
    calculateRefundableAmount
} from '@/lib/utils/payments';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';

// Column mappings for payments
const paymentColumnMap = {
    id: payments.id,
    amount: payments.amount,
    status: payments.status,
    method: payments.method,
    created_at: payments.created_at,
    updated_at: payments.updated_at,
    course_title: courses.title,
    intake_id: intakes.id,
    user_name: profiles.full_name,
    user_email: profiles.email,
};

/**
 * Error handling utility
 */
export function handlePaymentError(error: unknown, operation: string): ApiResponse<never> {
    if (error instanceof PaymentValidationError) {
        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
        };
    }

    if (error instanceof Error) {
        logger.error(`Payment ${operation} failed:`, error);
        return {
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR'
        };
    }

    logger.error(`Unexpected error in payment ${operation}:`, { error });
    return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
    };
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminPaymentList(params: PaymentQueryParams): Promise<ApiResponse<{
    data: PaymentListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    try {
        await requireAdmin();

        const { page = 1, pageSize = 10, sortBy = 'created_at', order = 'desc', filters = [], search } = params;
        const offset = (page - 1) * pageSize;

        const filterConditions = buildFilterConditions(filters, paymentColumnMap);
        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(
                sql`(${profiles.full_name} ILIKE ${searchFilter} OR ${profiles.email} ILIKE ${searchFilter} OR ${courses.title} ILIKE ${searchFilter})`
            );
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, paymentColumnMap);

        const queryBuilder = db
            .select({
                id: payments.id,
                amount: payments.amount,
                status: payments.status,
                method: payments.method,
                created_at: payments.created_at,
                updated_at: payments.updated_at,
                enrollment: { id: enrollments.id, course_title: courses.title, intake_id: intakes.id },
                user: { id: profiles.id, full_name: profiles.full_name, email: profiles.email },
            })
            .from(payments)
            .leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id))
            .leftJoin(intakes, eq(enrollments.intake_id, intakes.id))
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .leftJoin(profiles, eq(enrollments.user_id, profiles.id));

        const query = whereClause ? queryBuilder.where(whereClause) : queryBuilder;
        const finalQuery = orderBy ? query.orderBy(orderBy) : query;

        const [results, countResult] = await Promise.all([
            finalQuery.limit(pageSize).offset(offset),
            db.select({ count: sql<number>`count(*)` }).from(payments).leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id)).leftJoin(profiles, eq(enrollments.user_id, profiles.id)).leftJoin(intakes, eq(enrollments.intake_id, intakes.id)).leftJoin(courses, eq(intakes.course_id, courses.id)).where(whereClause)
        ]);

        const data: PaymentListItem[] = results.map(r => ({
            id: r.id,
            amount: r.amount,
            status: r.status,
            method: r.method,
            created_at: r.created_at,
            updated_at: r.updated_at,
            enrollment: r.enrollment?.id ? { id: r.enrollment.id, course_title: r.enrollment.course_title!, intake_id: r.enrollment.intake_id! } : null,
            user: r.user?.id ? { id: r.user.id, full_name: r.user.full_name!, email: r.user.email! } : null,
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
        return handlePaymentError(error, 'list');
    }
}

/**
 * Single comprehensive details function with proper joins
 */
export async function adminPaymentDetails(id: string): Promise<ApiResponse<PaymentWithDetails>> {
    try {
        await requireAdmin();

        const paymentData = await db.query.payments.findFirst({
            where: eq(payments.id, id),
            with: {
                enrollment: {
                    with: {
                        user: true,
                        intake: {
                            with: {
                                course: true
                            }
                        }
                    }
                }
            }
        });

        if (!paymentData) {
            return { success: false, error: 'Payment not found', code: 'NOT_FOUND' };
        }

        const { enrollment, ...payment } = paymentData;
        const user = enrollment?.user || null;
        const course = enrollment?.intake?.course || null;

        return {
            success: true,
            data: {
                payment,
                enrollment: enrollment || null,
                user,
                course
            }
        };
    } catch (error) {
        return handlePaymentError(error, 'details');
    }
}

export async function adminPaymentDetailsByEnrollmentId(enrollmentId: string): Promise<ApiResponse<PaymentWithDetails>> {
    try {
        await requireAdmin();

        const paymentData = await db.query.payments.findFirst({
            where: eq(payments.enrollment_id, enrollmentId),
            with: {
                enrollment: {
                    with: {
                        user: true,
                        intake: {
                            with: {
                                course: true
                            }
                        }
                    }
                }
            }
        });

        if (!paymentData) {
            return { success: false, error: 'Payment not found', code: 'NOT_FOUND' };
        }

        const { enrollment, ...payment } = paymentData;
        const user = enrollment?.user || null;
        const course = enrollment?.intake?.course || null;

        return {
            success: true,
            data: {
                payment,
                enrollment: enrollment || null,
                user,
                course
            }
        };
    } catch (error) {
        return handlePaymentError(error, 'details-by-enrollment-id');
    }
}

/**
 * Optimized CRUD operations with validation
 */
export async function adminPaymentCreate(data: PaymentCreateData): Promise<ApiResponse<PaymentBase>> {
    try {
        await requireAdmin();

        const validation = validatePaymentData(data);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        const [created] = await db.insert(payments).values(data).returning();

        revalidatePath('/admin/payments');
        return { success: true, data: created };
    } catch (error: any) {
        return handlePaymentError(error, 'create');
    }
}

export async function adminPaymentUpdate(data: PaymentUpdateData): Promise<ApiResponse<PaymentBase>> {
    try {
        await requireAdmin();

        const validation = validatePaymentData(data);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        const { id, ...updateData } = data;

        const [updated] = await db.update(payments).set({ ...updateData, updated_at: sql`now()` }).where(eq(payments.id, id)).returning();

        if (!updated) {
            return { success: false, error: 'Payment not found', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/payments');
        revalidatePath(`/admin/payments/${id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        return handlePaymentError(error, 'update');
    }
}

export async function adminPaymentDelete(id: string): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        const constraints = await checkPaymentConstraints(id);
        if (!constraints.canDelete) {
            return { success: false, error: 'Cannot delete this payment due to business rules or dependencies.', code: 'CONSTRAINT_VIOLATION' };
        }

        const [deleted] = await db.delete(payments).where(eq(payments.id, id)).returning();

        if (!deleted) {
            return { success: false, error: 'Payment not found', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error) {
        return handlePaymentError(error, 'delete');
    }
}

/**
 * Business-specific operations
 */
export async function adminPaymentCheckConstraints(id: string): Promise<ApiResponse<PaymentConstraintCheck>> {
    try {
        await requireAdmin();
        const result = await checkPaymentConstraints(id);
        return { success: true, data: result };
    } catch (error) {
        return handlePaymentError(error, 'constraint-check');
    }
}

export async function adminPaymentUpdateStatus(data: PaymentStatusUpdate): Promise<ApiResponse<PaymentBase>> {
    try {
        await requireAdmin();

        const currentPayment = await db.query.payments.findFirst({ where: eq(payments.id, data.id), columns: { status: true } });

        if (!currentPayment) {
            return { success: false, error: 'Payment not found', code: 'NOT_FOUND' };
        }

        if (!canUpdatePaymentStatus(currentPayment.status, data.status)) {
            return { success: false, error: `Cannot transition from ${currentPayment.status} to ${data.status}`, code: 'INVALID_STATUS_TRANSITION' };
        }

        const [updated] = await db.update(payments).set({ status: data.status, remarks: data.remarks, updated_at: sql`now()` }).where(eq(payments.id, data.id)).returning();

        if (!updated) {
            return { success: false, error: 'Payment not found during update', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/payments');
        revalidatePath(`/admin/payments/${data.id}`);
        return { success: true, data: updated };
    } catch (error) {
        return handlePaymentError(error, 'status-update');
    }
}

/**
 * Refund operation with transactional integrity
 */
export async function adminPaymentRefund(data: PaymentRefundData): Promise<ApiResponse<{ refundId: string }>> {
    try {
        await requireAdmin();

        const payment = await db.query.payments.findFirst({
            where: and(eq(payments.id, data.payment_id), eq(payments.status, 'completed')),
            with: { enrollment: { columns: { user_id: true } } }
        });

        if (!payment) {
            return { success: false, error: 'Completed payment not found', code: 'NOT_FOUND' };
        }

        const refundedAmount = payment.refunded_amount || 0;
        const refundableAmount = calculateRefundableAmount(payment.amount, refundedAmount);

        const validation = validateRefundData(data, refundableAmount);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        const refundId = await db.transaction(async (tx) => {
            const [newRefund] = await tx.insert(refunds).values({
                ...data,
                enrollment_id: payment.enrollment_id,
                user_id: payment.enrollment?.user_id
            }).returning({ id: refunds.id });

            const newRefundedAmount = refundedAmount + data.amount;
            const newStatus = newRefundedAmount >= payment.amount ? 'refunded' : 'completed';

            await tx.update(payments).set({
                status: newStatus,
                is_refunded: true,
                refunded_amount: newRefundedAmount,
                refunded_at: new Date().toISOString(),
                updated_at: sql`now()`,
            }).where(eq(payments.id, data.payment_id));

            return newRefund.id;
        });

        revalidatePath('/admin/payments');
        revalidatePath(`/admin/payments/${data.payment_id}`);
        return { success: true, data: { refundId } };

    } catch (error) {
        return handlePaymentError(error, 'refund');
    }
}