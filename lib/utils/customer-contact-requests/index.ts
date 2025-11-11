import { db } from '@/lib/db/drizzle';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { eq, sql } from 'drizzle-orm';
import {
    CustomerContactRequestCreateData,
    CustomerContactRequestUpdateData,
    CustomerContactRequestConstraintCheck,
} from '@/lib/types/customer-contact-requests';

/**
 * Customer contact request validation utilities
 */

export class CustomerContactRequestValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'CustomerContactRequestValidationError';
    }
}

/**
 * Validates customer contact request name
 * @param name - The request name to validate
 * @throws CustomerContactRequestValidationError if validation fails
 */
export function validateRequestName(name: string): void {
    if (name.length < 2) {
        throw new CustomerContactRequestValidationError(
            'Name must be at least 2 characters long',
            'NAME_TOO_SHORT',
            { name, length: name.length }
        );
    }

    if (name.length > 100) {
        throw new CustomerContactRequestValidationError(
            'Name cannot exceed 100 characters',
            'NAME_TOO_LONG',
            { name, length: name.length }
        );
    }
}

/**
 * Validates customer contact request email
 * @param email - The request email to validate
 * @throws CustomerContactRequestValidationError if validation fails
 */
export function validateRequestEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new CustomerContactRequestValidationError(
            'Please provide a valid email address',
            'INVALID_EMAIL',
            { email }
        );
    }

    if (email.length > 255) {
        throw new CustomerContactRequestValidationError(
            'Email cannot exceed 255 characters',
            'EMAIL_TOO_LONG',
            { email, length: email.length }
        );
    }
}

/**
 * Validates customer contact request subject
 * @param subject - The request subject to validate
 * @throws CustomerContactRequestValidationError if validation fails
 */
export function validateRequestSubject(subject: string): void {
    if (subject.length < 3) {
        throw new CustomerContactRequestValidationError(
            'Subject must be at least 3 characters long',
            'SUBJECT_TOO_SHORT',
            { subject, length: subject.length }
        );
    }

    if (subject.length > 255) {
        throw new CustomerContactRequestValidationError(
            'Subject cannot exceed 255 characters',
            'SUBJECT_TOO_LONG',
            { subject, length: subject.length }
        );
    }
}

/**
 * Validates customer contact request message
 * @param message - The request message to validate
 * @throws CustomerContactRequestValidationError if validation fails
 */
export function validateRequestMessage(message: string): void {
    if (message.length < 10) {
        throw new CustomerContactRequestValidationError(
            'Message must be at least 10 characters long',
            'MESSAGE_TOO_SHORT',
            { message, length: message.length }
        );
    }

    if (message.length > 5000) {
        throw new CustomerContactRequestValidationError(
            'Message cannot exceed 5000 characters',
            'MESSAGE_TOO_LONG',
            { message, length: message.length }
        );
    }
}

/**
 * Validates customer contact request data
 * @param data - The request data to validate
 * @returns ValidationResult
 */
export function validateCustomerContactRequestData(
    data: CustomerContactRequestCreateData | CustomerContactRequestUpdateData
) {
    try {
        validateRequestName(data.name);
        validateRequestEmail(data.email);
        validateRequestMessage(data.message);
        return { success: true };
    } catch (error) {
        if (error instanceof CustomerContactRequestValidationError) {
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
 * Customer contact request constraint checking utilities
 */

/**
 * Checks if a customer contact request can be deleted
 * @param id - The request ID to check
 * @returns Object with canDelete flag
 */
export async function checkCustomerContactRequestConstraints(
    id: string
): Promise<CustomerContactRequestConstraintCheck> {
    try {
        // For now, we allow deletion of any request
        // This could be extended with business rules if needed
        return {
            canDelete: true,
        };
    } catch (error) {
        console.error(
            'Error checking customer contact request constraints:',
            error
        );
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
 * Checks if customer contact request status can be updated
 * @param currentStatus - Current request status
 * @param newStatus - New request status
 * @returns boolean indicating if update is allowed
 */
export function canUpdateCustomerContactRequestStatus(
    currentStatus: string,
    newStatus: string
): boolean {
    // Valid status transitions
    const validTransitions: Record<string, string[]> = {
        new: ['in-progress', 'resolved', 'closed'],
        'in-progress': ['resolved', 'closed'],
        resolved: ['closed'],
        closed: [],
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
 * @param currentStatus - Current request status
 * @returns Array of valid status transitions
 */
export function getValidStatusTransitions(currentStatus: string): string[] {
    const validTransitions: Record<string, string[]> = {
        new: ['in-progress', 'resolved', 'closed'],
        'in-progress': ['resolved', 'closed'],
        resolved: ['closed'],
        closed: [],
    };

    return validTransitions[currentStatus] || [];
}
