// /server-action/user/payments.ts
'use server';

import {and, eq} from 'drizzle-orm';
import {cache} from 'react';
import {db} from '@/lib/db/drizzle';
import type {ZodInsertPaymentType} from '@/lib/db/drizzle-zod-schema/payments';
import {courses as coursesTable} from '@/lib/db/schema/courses';
import {enrollments as enrollmentsTable} from '@/lib/db/schema/enrollments';
import {intakes as intakesTable} from '@/lib/db/schema/intakes';
import {payments as paymentsTable} from '@/lib/db/schema/payments';

type PaymentInsert = ZodInsertPaymentType;

/**
 * Create a new payment for an enrollment (must be owned by the current user)
 */
export async function createPayment(
    input: Omit<PaymentInsert, 'id' | 'status'> & {
        enrollment_id: string;
        userId: string;
    }
) {
    try {

        const {enrollment_id, userId} = input;

        // Ensure that this enrollment belongs to the current user
        const [enrollment] = await db
            .select({
                id: enrollmentsTable.id,
                user_id: enrollmentsTable.user_id,
            })
            .from(enrollmentsTable)
            .where(
                and(
                    eq(enrollmentsTable.id, enrollment_id),
                    eq(enrollmentsTable.user_id, userId)
                )
            );

        if (!enrollment) {
            return {
                success: false,
                error: 'Enrollment not found or does not belong to you',
            };
        }

        // Insert new payment
        const [newPayment] = await db
            .insert(paymentsTable)
            .values({
                ...input,
                enrollment_id,
                status: 'pending',
            })
            .returning();

        return {success: true, data: newPayment};
    } catch (error) {
        const e = error as Error;
        return {success: false, error: e.message};
    }
}

/**
 * Get logged-in user’s payment history with course details
 */
export async function getUserPaymentHistory(page = 1, pageSize = 10, userId: string) {
    try {
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
            .leftJoin(intakesTable, eq(enrollmentsTable.intake_id, intakesTable.id))
            .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
            .where(eq(enrollmentsTable.user_id, userId))
            .limit(pageSize)
            .offset(offset);

        return {success: true, data};
    } catch (error) {
        const e = error as Error;
        return {success: false, error: e.message};
    }
}

export const getCachedUserPaymentHistory = cache(getUserPaymentHistory);
