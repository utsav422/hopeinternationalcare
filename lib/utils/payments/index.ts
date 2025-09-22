import { db } from '@/lib/db/drizzle';
import { payments } from '@/lib/db/schema/payments';
import { eq, sql } from 'drizzle-orm';
import { PaymentCreateData, PaymentUpdateData, PaymentConstraintCheck, PaymentRefundData } from '@/lib/types';

/**
 * Payment validation utilities
 */

export class PaymentValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'PaymentValidationError';
    }
}

/**
 * Validates payment amount
 * @param amount - The payment amount to validate
 * @throws PaymentValidationError if validation fails
 */
export function validatePaymentAmount(amount: number): void {
    if (amount <= 0) {
        throw new PaymentValidationError(
            'Amount must be greater than zero',
            'INVALID_AMOUNT',
            { amount }
        );
    }

    if (amount > 1000000) {
        throw new PaymentValidationError(
            'Amount cannot exceed 1,000,000',
            'AMOUNT_TOO_LARGE',
            { amount }
        );
    }
}

/**
 * Validates payment currency
 * @param currency - The payment currency to validate
 * @throws PaymentValidationError if validation fails
 */
export function validatePaymentCurrency(currency: string): void {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'NPR', 'AUD', 'CAD'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
        throw new PaymentValidationError(
            'Invalid currency code',
            'INVALID_CURRENCY',
            { currency, validCurrencies }
        );
    }
}

/**
 * Validates payment status
 * @param status - The payment status to validate
 * @throws PaymentValidationError if validation fails
 */
export function validatePaymentStatus(status: string): void {
    const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new PaymentValidationError(
            'Invalid payment status',
            'INVALID_STATUS',
            { status, validStatuses }
        );
    }
}

/**
 * Validates payment method
 * @param method - The payment method to validate
 * @throws PaymentValidationError if validation fails
 */
export function validatePaymentMethod(method: string): void {
    const validMethods = ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'cash', 'other'];
    if (!validMethods.includes(method)) {
        throw new PaymentValidationError(
            'Invalid payment method',
            'INVALID_PAYMENT_METHOD',
            { method, validMethods }
        );
    }
}

/**
 * Validates payment refund amount
 * @param amount - The refund amount to validate
 * @param maxAmount - The maximum refundable amount
 * @throws PaymentValidationError if validation fails
 */
export function validateRefundAmount(amount: number, maxAmount: number): void {
    if (amount <= 0) {
        throw new PaymentValidationError(
            'Refund amount must be greater than zero',
            'INVALID_REFUND_AMOUNT',
            { amount }
        );
    }

    if (amount > maxAmount) {
        throw new PaymentValidationError(
            'Refund amount cannot exceed the payment amount',
            'REFUND_AMOUNT_TOO_LARGE',
            { amount, maxAmount }
        );
    }
}

/**
 * Validates payment data
 * @param data - The payment data to validate
 * @returns ValidationResult
 */
export function validatePaymentData(data: PaymentCreateData | PaymentUpdateData) {
    try {
        if ('amount' in data) {
            validatePaymentAmount(data.amount);
        }
        if ('status' in data) {

            validatePaymentStatus(data.status as string);
        }
        if ('payment_method' in data) {
            validatePaymentMethod(data.payment_method as string);
        }
        return { success: true };
    } catch (error) {
        if (error instanceof PaymentValidationError) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                details: error.details
            };
        }
        return {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR'
        };
    }
}

/**
 * Validates refund data
 * @param data - The refund data to validate
 * @param maxAmount - The maximum refundable amount
 * @returns ValidationResult
 */
export function validateRefundData(data: PaymentRefundData, maxAmount: number) {
    try {
        validateRefundAmount(data.amount, maxAmount);
        if (!data.reason || data.reason.length < 3) {
            throw new PaymentValidationError(
                'Refund reason must be at least 3 characters long',
                'INVALID_REFUND_REASON',
                { reason: data.reason }
            );
        }
        return { success: true };
    } catch (error) {
        if (error instanceof PaymentValidationError) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                details: error.details
            };
        }
        return {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR'
        };
    }
}

/**
 * Payment constraint checking utilities
 */

/**
 * Checks if a payment can be deleted
 * @param id - The payment ID to check
 * @returns Object with canDelete flag
 */
export async function checkPaymentConstraints(id: string): Promise<PaymentConstraintCheck> {
    try {
        // For now, we allow deletion of any payment
        // This could be extended with business rules if needed
        return {
            canDelete: true
        };
    } catch (error) {
        console.error('Error checking payment constraints:', error);
        // In case of error, assume it cannot be deleted for safety
        return {
            canDelete: false
        };
    }
}

/**
 * Business rule enforcement utilities
 */

/**
 * Checks if payment status can be updated
 * @param currentStatus - Current payment status
 * @param newStatus - New payment status
 * @returns boolean indicating if update is allowed
 */
export function canUpdatePaymentStatus(currentStatus: string, newStatus: string): boolean {
    // Valid status transitions
    const validTransitions: Record<string, string[]> = {
        'pending': ['completed', 'failed', 'cancelled'],
        'completed': ['refunded'],
        'failed': ['pending'],
        'refunded': [],
        'cancelled': []
    };

    // If current status is not in validTransitions, allow any update
    if (!validTransitions[currentStatus]) {
        return true;
    }

    // Check if new status is in valid transitions
    return validTransitions[currentStatus].includes(newStatus);
}

/**
 * Gets valid status transitions for a given status
 * @param currentStatus - Current payment status
 * @returns Array of valid status transitions
 */
export function getValidPaymentStatusTransitions(currentStatus: string): string[] {
    const validTransitions: Record<string, string[]> = {
        'pending': ['completed', 'failed', 'cancelled'],
        'completed': ['refunded'],
        'failed': ['pending'],
        'refunded': [],
        'cancelled': []
    };

    return validTransitions[currentStatus] || [];
}

/**
 * Calculates refundable amount for a payment
 * @param paymentAmount - The original payment amount
 * @param refundedAmount - The amount already refunded
 * @returns The refundable amount
 */
export function calculateRefundableAmount(paymentAmount: number, refundedAmount: number): number {
    return Math.max(0, paymentAmount - refundedAmount);
}