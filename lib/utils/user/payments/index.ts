import { db } from '@/lib/db/drizzle';
import { payments, enrollments } from '@/lib/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { CreatePaymentData } from '../../types/user/payments';

/**
 * User payment validation utilities
 */

export class UserPaymentValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'UserPaymentValidationError';
  }
}

/**
 * Validates payment creation data
 * @param data - The payment data to validate
 * @throws UserPaymentValidationError if validation fails
 */
export function validatePaymentData(data: CreatePaymentData): void {
  if (!data.enrollment_id || typeof data.enrollment_id !== 'string') {
    throw new UserPaymentValidationError(
      'Enrollment ID is required and must be a string',
      'INVALID_ENROLLMENT_ID',
      { enrollment_id: data.enrollment_id }
    );
  }
  
  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    throw new UserPaymentValidationError(
      'Amount is required and must be a positive number',
      'INVALID_AMOUNT',
      { amount: data.amount }
    );
  }
  
  if (!data.currency || typeof data.currency !== 'string') {
    throw new UserPaymentValidationError(
      'Currency is required and must be a string',
      'INVALID_CURRENCY',
      { currency: data.currency }
    );
  }
  
  if (!data.payment_method || typeof data.payment_method !== 'string') {
    throw new UserPaymentValidationError(
      'Payment method is required and must be a string',
      'INVALID_PAYMENT_METHOD',
      { payment_method: data.payment_method }
    );
  }
  
  if (!data.userId || typeof data.userId !== 'string') {
    throw new UserPaymentValidationError(
      'User ID is required and must be a string',
      'INVALID_USER_ID',
      { userId: data.userId }
    );
  }
}

/**
 * User payment business logic utilities
 */

/**
 * Checks if an enrollment belongs to a user
 * @param enrollmentId - The enrollment ID
 * @param userId - The user ID
 * @returns Promise<boolean> indicating if enrollment belongs to user
 */
export async function isEnrollmentOwnedByUser(enrollmentId: string, userId: string): Promise<boolean> {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollments)
      .where(and(
        eq(enrollments.id, enrollmentId),
        eq(enrollments.user_id, userId)
      ));
    
    return count > 0;
  } catch (error) {
    console.error('Error checking enrollment ownership:', error);
    return false;
  }
}

/**
 * Calculates payment status based on transaction details
 * @param transactionId - The transaction ID
 * @returns Payment status string
 */
export function calculatePaymentStatus(transactionId: string | undefined): string {
  return transactionId ? 'completed' : 'pending';
}

/**
 * Formats currency amount for display
 * @param amount - The amount to format
 * @param currency - The currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(amount);
}