import { db } from '@/lib/db/drizzle';
import { customerContactReplies } from '@/lib/db/schema/customer-contact-replies';
import { eq, sql } from 'drizzle-orm';
import { CustomerContactReplyCreateData, CustomerContactReplyUpdateData, CustomerContactReplyConstraintCheck } from '@/lib/types/customer-contact-replies';

/**
 * Customer contact reply validation utilities
 */

export class CustomerContactReplyValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'CustomerContactReplyValidationError';
    }
}

/**
 * Validates customer contact reply subject
 * @param subject - The reply subject to validate
 * @throws CustomerContactReplyValidationError if validation fails
 */
export function validateReplySubject(subject: string): void {
    if (subject.length < 3) {
        throw new CustomerContactReplyValidationError(
            'Subject must be at least 3 characters long',
            'SUBJECT_TOO_SHORT',
            { subject, length: subject.length }
        );
    }

    if (subject.length > 255) {
        throw new CustomerContactReplyValidationError(
            'Subject cannot exceed 255 characters',
            'SUBJECT_TOO_LONG',
            { subject, length: subject.length }
        );
    }
}

/**
 * Validates customer contact reply message
 * @param message - The reply message to validate
 * @throws CustomerContactReplyValidationError if validation fails
 */
export function validateReplyMessage(message: string): void {
    if (message.length < 10) {
        throw new CustomerContactReplyValidationError(
            'Message must be at least 10 characters long',
            'MESSAGE_TOO_SHORT',
            { message, length: message.length }
        );
    }

    if (message.length > 5000) {
        throw new CustomerContactReplyValidationError(
            'Message cannot exceed 5000 characters',
            'MESSAGE_TOO_LONG',
            { message, length: message.length }
        );
    }
}

/**
 * Validates customer contact reply data
 * @param data - The reply data to validate
 * @returns ValidationResult
 */
export function validateCustomerContactReplyData(data: CustomerContactReplyCreateData | CustomerContactReplyUpdateData) {
    try {
        validateReplySubject(data?.subject ?? '');
        validateReplyMessage(data?.message ?? '');
        return { success: true };
    } catch (error) {
        if (error instanceof CustomerContactReplyValidationError) {
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
 * Customer contact reply constraint checking utilities
 */

/**
 * Checks if a customer contact reply can be deleted
 * @param id - The reply ID to check
 * @returns Object with canDelete flag
 */
export async function checkCustomerContactReplyConstraints(id: string): Promise<CustomerContactReplyConstraintCheck> {
    try {
        // For now, we allow deletion of any reply
        // This could be extended with business rules if needed
        return {
            canDelete: true
        };
    } catch (error) {
        console.error('Error checking customer contact reply constraints:', error);
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
 * Checks if customer contact reply status can be updated
 * @param currentStatus - Current reply status
 * @param newStatus - New reply status
 * @returns boolean indicating if update is allowed
 */
export function canUpdateCustomerContactReplyStatus(currentStatus: boolean, newStatus: boolean): boolean {
    // For now, allow any status update
    // This could be extended with business rules if needed
    return true;
}