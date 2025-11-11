import {
    RefundCreateData,
    RefundUpdateData,
    RefundConstraintCheck,
} from '@/lib/types';

/**
 * Refund validation utilities
 */

export class RefundValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'RefundValidationError';
    }
}

/**
 * Validates refund amount
 * @param amount - The refund amount to validate
 * @throws RefundValidationError if validation fails
 */
export function validateRefundAmount(amount: number): void {
    if (amount <= 0) {
        throw new RefundValidationError(
            'Amount must be greater than zero',
            'INVALID_AMOUNT',
            { amount }
        );
    }

    if (amount > 1000000) {
        throw new RefundValidationError(
            'Amount cannot exceed 1,000,000',
            'AMOUNT_TOO_LARGE',
            { amount }
        );
    }
}

/**
 * Validates refund currency
 * @param currency - The refund currency to validate
 * @throws RefundValidationError if validation fails
 */
export function validateRefundCurrency(currency: string): void {
    const validCurrencies = ['USD', 'EUR', 'GBP', 'NPR', 'AUD', 'CAD'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
        throw new RefundValidationError(
            'Invalid currency code',
            'INVALID_CURRENCY',
            { currency, validCurrencies }
        );
    }
}

/**
 * Validates refund status
 * @param status - The refund status to validate
 * @throws RefundValidationError if validation fails
 */
export function validateRefundStatus(status: string): void {
    const validStatuses = [
        'pending',
        'approved',
        'rejected',
        'processed',
        'failed',
    ];
    if (!validStatuses.includes(status)) {
        throw new RefundValidationError(
            'Invalid refund status',
            'INVALID_STATUS',
            { status, validStatuses }
        );
    }
}

/**
 * Validates refund reason
 * @param reason - The refund reason to validate
 * @throws RefundValidationError if validation fails
 */
export function validateRefundReason(reason: string): void {
    if (!reason || reason.length < 3) {
        throw new RefundValidationError(
            'Refund reason must be at least 3 characters long',
            'INVALID_REASON',
            { reason }
        );
    }

    if (reason.length > 1000) {
        throw new RefundValidationError(
            'Refund reason cannot exceed 1000 characters',
            'REASON_TOO_LONG',
            { reason, length: reason.length }
        );
    }
}

/**
 * Validates refund data
 * @param data - The refund data to validate
 * @returns ValidationResult
 */
export function validateRefundData(data: RefundCreateData | RefundUpdateData) {
    try {
        if ('amount' in data) {
            validateRefundAmount(data.amount ?? 0);
        }
        if ('status' in data) {
            validateRefundStatus(data.status as string);
        }
        if ('reason' in data) {
            validateRefundReason(data.reason ?? '');
        }
        return { success: true };
    } catch (error) {
        if (error instanceof RefundValidationError) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                details: error.details,
            };
        }
        return {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
        };
    }
}

/**
 * Refund constraint checking utilities
 */

/**
 * Checks if a refund can be deleted
 * @param id - The refund ID to check
 * @returns Object with canDelete flag
 */
export async function checkRefundConstraints(
    id: string
): Promise<RefundConstraintCheck> {
    try {
        // For now, we allow deletion of any refund
        // This could be extended with business rules if needed
        return {
            canDelete: true,
        };
    } catch (error) {
        console.error('Error checking refund constraints:', error);
        // In case of error, assume it cannot be deleted for safety
        return {
            canDelete: false,
        };
    }
}

/**
 * Business rule enforcement utilities
 */

/**
 * Checks if refund status can be updated
 * @param currentStatus - Current refund status
 * @param newStatus - New refund status
 * @returns boolean indicating if update is allowed
 */
export function canUpdateRefundStatus(
    currentStatus: string,
    newStatus: string
): boolean {
    // Valid status transitions
    const validTransitions: Record<string, string[]> = {
        pending: ['approved', 'rejected'],
        approved: ['processed', 'failed'],
        rejected: [],
        processed: [],
        failed: [],
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
 * @param currentStatus - Current refund status
 * @returns Array of valid status transitions
 */
export function getValidRefundStatusTransitions(
    currentStatus: string
): string[] {
    const validTransitions: Record<string, string[]> = {
        pending: ['approved', 'rejected'],
        approved: ['processed', 'failed'],
        rejected: [],
        processed: [],
        failed: [],
    };

    return validTransitions[currentStatus] || [];
}
