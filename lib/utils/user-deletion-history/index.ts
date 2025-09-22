import { db } from '@/lib/db/drizzle';
import { userDeletionHistory } from '@/lib/db/schema/user-deletion-history';
import { and, eq, SQL, sql } from 'drizzle-orm';
import { UserDeletionHistoryCreateData, UserDeletionHistoryUpdateData, UserDeletionHistoryConstraintCheck } from '@/lib/types';

/**
 * User deletion history validation utilities
 */

export class UserDeletionHistoryValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'UserDeletionHistoryValidationError';
    }
}

/**
 * Validates deletion reason
 * @param reason - The deletion reason to validate
 * @throws UserDeletionHistoryValidationError if validation fails
 */
export function validateDeletionReason(reason: string): void {
    if (!reason || reason.length < 3) {
        throw new UserDeletionHistoryValidationError(
            'Deletion reason must be at least 3 characters long',
            'REASON_TOO_SHORT',
            { reason, length: reason.length }
        );
    }

    if (reason.length > 1000) {
        throw new UserDeletionHistoryValidationError(
            'Deletion reason cannot exceed 1000 characters',
            'REASON_TOO_LONG',
            { reason, length: reason.length }
        );
    }
}

/**
 * Validates user name
 * @param name - The user name to validate
 * @throws UserDeletionHistoryValidationError if validation fails
 */
export function validateUserName(name: string): void {
    if (!name || name.length < 1) {
        throw new UserDeletionHistoryValidationError(
            'User name is required',
            'NAME_REQUIRED',
            { name }
        );
    }

    if (name.length > 100) {
        throw new UserDeletionHistoryValidationError(
            'User name cannot exceed 100 characters',
            'NAME_TOO_LONG',
            { name, length: name.length }
        );
    }
}

/**
 * Validates user email
 * @param email - The user email to validate
 * @throws UserDeletionHistoryValidationError if validation fails
 */
export function validateUserEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new UserDeletionHistoryValidationError(
            'Please provide a valid email address',
            'INVALID_EMAIL',
            { email }
        );
    }

    if (email.length > 255) {
        throw new UserDeletionHistoryValidationError(
            'Email cannot exceed 255 characters',
            'EMAIL_TOO_LONG',
            { email, length: email.length }
        );
    }
}

/**
 * Validates deletion status
 * @param status - The deletion status to validate
 * @throws UserDeletionHistoryValidationError if validation fails
 */
export function validateDeletionStatus(status: string): void {
    const validStatuses = ['scheduled', 'pending', 'completed', 'cancelled', 'failed'];
    if (!validStatuses.includes(status)) {
        throw new UserDeletionHistoryValidationError(
            'Invalid deletion status',
            'INVALID_STATUS',
            { status, validStatuses }
        );
    }
}

/**
 * Validates user deletion history data
 * @param data - The user deletion history data to validate
 * @returns ValidationResult
 */
export function validateUserDeletionHistoryData(data: UserDeletionHistoryCreateData | UserDeletionHistoryUpdateData) {
    try {
        if ('deletion_reason' in data) {
            validateDeletionReason(data.deletion_reason);
        }
        if ('name' in data) {
            validateUserName(data.name as string);
        }
        if ('email' in data) {
            validateUserEmail(data.email as string);
        }
        return { success: true };
    } catch (error) {
        if (error instanceof UserDeletionHistoryValidationError) {
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
 * User deletion history constraint checking utilities
 */

/**
 * Checks if a user deletion history record can be deleted
 * @param id - The user deletion history ID to check
 * @returns Object with canDelete flag
 */
export async function checkUserDeletionHistoryConstraints(id: string): Promise<UserDeletionHistoryConstraintCheck> {
    try {
        // For now, we allow deletion of any user deletion history record
        // This could be extended with business rules if needed
        return {
            canDelete: true
        };
    } catch (error) {
        console.error('Error checking user deletion history constraints:', error);
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
 * Checks if user deletion history status can be updated
 * @param currentStatus - Current user deletion history status
 * @param newStatus - New user deletion history status
 * @returns boolean indicating if update is allowed
 */
export function canUpdateUserDeletionHistoryStatus(currentStatus: string, newStatus: string): boolean {
    // Valid status transitions
    const validTransitions: Record<string, string[]> = {
        'scheduled': ['pending', 'cancelled'],
        'pending': ['completed', 'failed', 'cancelled'],
        'completed': [],
        'cancelled': [],
        'failed': ['pending']
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
 * @param currentStatus - Current user deletion history status
 * @returns Array of valid status transitions
 */
export function getValidUserDeletionHistoryStatusTransitions(currentStatus: string): string[] {
    const validTransitions: Record<string, string[]> = {
        'scheduled': ['pending', 'cancelled'],
        'pending': ['completed', 'failed', 'cancelled'],
        'completed': [],
        'cancelled': [],
        'failed': ['pending']
    };

    return validTransitions[currentStatus] || [];
}

/**
 * Checks if a user can be deleted based on their deletion history
 * @param userId - The user ID to check
 * @returns boolean indicating if user can be deleted
 */
export async function canDeleteUser(userId: string): Promise<boolean> {
    try {
        // Check if user has any pending or scheduled deletions
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(userDeletionHistory)
            .where(
                and(
                    eq(userDeletionHistory.user_id, userId),
                    sql`status IN ('scheduled', 'pending')`
                )
            );

        return count === 0;
    } catch (error) {
        console.error('Error checking if user can be deleted:', error);
        // In case of error, assume user cannot be deleted for safety
        return false;
    }
}


