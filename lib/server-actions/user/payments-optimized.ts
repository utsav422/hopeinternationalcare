'use server';

import { and, eq, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import {
    payments as paymentsTable,
    enrollments as enrollmentsTable,
    intakes as intakesTable,
    courses as coursesTable,
} from '@/lib/db/schema';
import {
    CreatePaymentData,
    UserPaymentListItem,
    UserPaymentHistory,
    ApiResponse,
} from '@/lib/types/user/payments';
import {
    validatePaymentData,
    isEnrollmentOwnedByUser,
    UserPaymentValidationError,
} from '@/lib/utils/user/payments';
import { logger } from '@/lib/utils/logger';

/**
 * Error handling utility
 */
export async function handleUserPaymentError(
    error: unknown,
    operation: string
): Promise<ApiResponse<never>> {
    if (error instanceof UserPaymentValidationError) {
        return Promise.reject({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
        });
    }

    if (error instanceof Error) {
        logger.error(`User Payment ${operation} failed:`, {
            error: error.message,
            stack: error.stack,
        });
        return Promise.reject({
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR',
        });
    }

    logger.error(`Unexpected error in user payment ${operation}:`, {
        error: error instanceof Error ? error.message : String(error),
        rawError: JSON.stringify(error),
    });
    return Promise.reject({
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    });
}

/**
 * Create a new payment for an enrollment
 */
export async function createPayment(
    input: CreatePaymentData
): Promise<ApiResponse<UserPaymentListItem>> {
    try {
        // Validate data
        validatePaymentData(input);

        // Ensure that this enrollment belongs to the current user
        const isOwned = await isEnrollmentOwnedByUser(
            input.enrollment_id,
            input.userId
        );
        if (!isOwned) {
            return {
                success: false,
                error: 'Enrollment not found or does not belong to you',
                code: 'INVALID_ENROLLMENT',
            };
        }

        // Insert new payment
        const [newPayment] = await db
            .insert(paymentsTable)
            .values({
                enrollment_id: input.enrollment_id,
                amount: input.amount,
                status: 'pending',
                method: input.payment_method as any, // Need to cast since we don't have the exact enum type imported
            })
            .returning();

        // Transform the database payment object to match UserPaymentListItem interface
        const result: UserPaymentListItem = {
            paymentId: newPayment.id,
            amount: newPayment.amount,
            status: newPayment.status,
            paid_at: newPayment.paid_at,
            created_at: newPayment.created_at,
            intake_id: null, // This would need to be populated with a join if needed
            courseId: null, // This would need to be populated with a join if needed
            courseName: null, // This would need to be populated with a join if needed
        };

        return { success: true, data: result };
    } catch (error) {
        return handleUserPaymentError(error, 'create');
    }
}

/**
 * Get logged-in user's payment history with course details
 */
export async function getUserPaymentHistory(
    page = 1,
    pageSize = 10,
    userId: string
): Promise<ApiResponse<{ data: UserPaymentHistory[]; total: number }>> {
    try {
        if (!userId) {
            return {
                success: false,
                error: 'User ID is required',
                code: 'MISSING_USER_ID',
            };
        }

        const offset = (page - 1) * pageSize;

        const data = await db
            .select({
                paymentId: paymentsTable.id,
                amount: paymentsTable.amount,
                status: paymentsTable.status,
                paid_at: paymentsTable.paid_at,
                created_at: paymentsTable.created_at,
                intake_id: enrollmentsTable.intake_id,
                courseId: intakesTable.course_id,
                courseName: coursesTable.title,
            })
            .from(paymentsTable)
            .leftJoin(
                enrollmentsTable,
                eq(paymentsTable.enrollment_id, enrollmentsTable.id)
            )
            .leftJoin(
                intakesTable,
                eq(enrollmentsTable.intake_id, intakesTable.id)
            )
            .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
            .where(eq(enrollmentsTable.user_id, userId))
            .limit(pageSize)
            .offset(offset);

        // Get total count
        const [{ count: total }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(paymentsTable)
            .leftJoin(
                enrollmentsTable,
                eq(paymentsTable.enrollment_id, enrollmentsTable.id)
            )
            .where(eq(enrollmentsTable.user_id, userId));

        // Transform the raw query results to match UserPaymentHistory interface
        const transformedData: UserPaymentHistory[] = data.map(item => ({
            paymentId: item.paymentId,
            amount: item.amount,
            status: item.status,
            paid_at: item.paid_at,
            created_at: item.created_at,
            intake_id: item.intake_id,
            courseId: item.courseId,
            courseName: item.courseName,
        }));

        return { success: true, data: { data: transformedData, total } };
    } catch (error) {
        logger.error('Error fetching user payment history:', {
            error: error instanceof Error ? error.message : String(error),
            rawError: JSON.stringify(error),
        });
        return {
            success: false,
            error: 'Failed to fetch user payment history',
            code: 'FETCH_ERROR',
        };
    }
}

export const getCachedUserPaymentHistory = cache(getUserPaymentHistory);
