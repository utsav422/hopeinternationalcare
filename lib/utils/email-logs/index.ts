import { db } from '@/lib/db/drizzle';
import { emailLogs } from '@/lib/db/schema/email-logs';
import { eq, sql } from 'drizzle-orm';
import {
    EmailLogCreateData,
    EmailLogUpdateData,
    EmailLogConstraintCheck,
} from '@/lib/types/email-logs';

/**
 * Email log validation utilities
 */

export class EmailLogValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'EmailLogValidationError';
    }
}

/**
 * Validates email log recipient
 * @param recipient - The email recipient to validate
 * @throws EmailLogValidationError if validation fails
 */
export function validateEmailRecipient(recipient: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient)) {
        throw new EmailLogValidationError(
            'Please provide a valid email address',
            'INVALID_EMAIL',
            { recipient }
        );
    }

    if (recipient.length > 255) {
        throw new EmailLogValidationError(
            'Email cannot exceed 255 characters',
            'EMAIL_TOO_LONG',
            { recipient, length: recipient.length }
        );
    }
}

/**
 * Validates email log subject
 * @param subject - The email subject to validate
 * @throws EmailLogValidationError if validation fails
 */
export function validateEmailSubject(subject: string): void {
    if (subject.length < 1) {
        throw new EmailLogValidationError(
            'Subject cannot be empty',
            'SUBJECT_EMPTY',
            { subject, length: subject.length }
        );
    }

    if (subject.length > 255) {
        throw new EmailLogValidationError(
            'Subject cannot exceed 255 characters',
            'SUBJECT_TOO_LONG',
            { subject, length: subject.length }
        );
    }
}

/**
 * Validates email log status
 * @param status - The email status to validate
 * @throws EmailLogValidationError if validation fails
 */
export function validateEmailStatus(status: string): void {
    const validStatuses = ['pending', 'sent', 'failed', 'retry'];
    if (!validStatuses.includes(status)) {
        throw new EmailLogValidationError(
            'Invalid email status',
            'INVALID_STATUS',
            { status, validStatuses }
        );
    }
}

/**
 * Validates email log data
 * @param data - The email log data to validate
 * @returns ValidationResult
 */
export function validateEmailLogData(
    data: EmailLogCreateData | EmailLogUpdateData
) {
    try {
        if ('recipient' in data) {
            validateEmailRecipient(data.recipient as string);
        }
        if ('subject' in data) {
            validateEmailSubject(data.subject as string);
        }
        validateEmailStatus(data.status as string);
        return { success: true };
    } catch (error) {
        if (error instanceof EmailLogValidationError) {
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
 * Email log constraint checking utilities
 */

/**
 * Checks if an email log can be deleted
 * @param id - The email log ID to check
 * @returns Object with canDelete flag
 */
export async function checkEmailLogConstraints(
    id: string
): Promise<EmailLogConstraintCheck> {
    try {
        // For now, we allow deletion of any email log
        // This could be extended with business rules if needed
        return {
            canDelete: true,
        };
    } catch (error) {
        console.error('Error checking email log constraints:', error);
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
 * Checks if email log status can be updated
 * @param currentStatus - Current email log status
 * @param newStatus - New email log status
 * @returns boolean indicating if update is allowed
 */
export function canUpdateEmailLogStatus(
    currentStatus: string,
    newStatus: string
): boolean {
    // Valid status transitions
    const validTransitions: Record<string, string[]> = {
        pending: ['sent', 'failed'],
        sent: [],
        failed: ['retry'],
        retry: ['sent', 'failed'],
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
 * @param currentStatus - Current email log status
 * @returns Array of valid status transitions
 */
export function getValidEmailLogStatusTransitions(
    currentStatus: string
): string[] {
    const validTransitions: Record<string, string[]> = {
        pending: ['sent', 'failed'],
        sent: [],
        failed: ['retry'],
        retry: ['sent', 'failed'],
    };

    return validTransitions[currentStatus] || [];
}
