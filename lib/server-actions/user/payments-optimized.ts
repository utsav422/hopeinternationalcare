'use server';

import { and, eq, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import { 
  payments as paymentsTable,
  enrollments as enrollmentsTable,
  intakes as intakesTable,
  courses as coursesTable
} from '@/lib/db/schema';
import { 
  CreatePaymentData,
  UserPaymentListItem,
  UserPaymentHistory,
  ApiResponse
} from '@/lib/types/user/payments';
import { 
  validatePaymentData,
  isEnrollmentOwnedByUser,
  UserPaymentValidationError
} from '@/lib/utils/user/payments';
import { logger } from '@/lib/utils/logger';

/**
 * Error handling utility
 */
export function handleUserPaymentError(error: unknown, operation: string): ApiResponse<never> {
  if (error instanceof UserPaymentValidationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  if (error instanceof Error) {
    logger.error(`User Payment ${operation} failed:`, error);
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }
  
  logger.error(`Unexpected error in user payment ${operation}:`, error);
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Create a new payment for an enrollment
 */
export async function createPayment(input: CreatePaymentData): Promise<ApiResponse<UserPaymentListItem>> {
  try {
    // Validate data
    validatePaymentData(input);
    
    // Ensure that this enrollment belongs to the current user
    const isOwned = await isEnrollmentOwnedByUser(input.enrollment_id, input.userId);
    if (!isOwned) {
      return {
        success: false,
        error: 'Enrollment not found or does not belong to you',
        code: 'INVALID_ENROLLMENT'
      };
    }

    // Insert new payment
    const [newPayment] = await db
      .insert(paymentsTable)
      .values({
        enrollment_id: input.enrollment_id,
        amount: input.amount,
        currency: input.currency,
        payment_method: input.payment_method,
        transaction_id: input.transaction_id,
        metadata: input.metadata,
        status: 'pending',
      })
      .returning();

    return { success: true, data: newPayment };
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
        code: 'MISSING_USER_ID'
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
      .leftJoin(intakesTable, eq(enrollmentsTable.intake_id, intakesTable.id))
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

    return { success: true, data: { data, total } };
  } catch (error) {
    logger.error('Error fetching user payment history:', error);
    return {
      success: false,
      error: 'Failed to fetch user payment history',
      code: 'FETCH_ERROR'
    };
  }
}

export const getCachedUserPaymentHistory = cache(getUserPaymentHistory);