import { db } from '@/lib/db/drizzle';
import { enrollments } from '@/lib/db/schema/enrollments';
import { eq, sql } from 'drizzle-orm';
import { IntakeCreateData, IntakeUpdateData, IntakeConstraintCheck } from '@/lib/types';

/**
 * Intake validation utilities
 */

export class IntakeValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'IntakeValidationError';
    }
}

/**
 * Validates intake name
 * @param name - The intake name to validate
 * @throws IntakeValidationError if validation fails
 */
export function validateIntakeName(name: string): void {
    if (name.length < 3) {
        throw new IntakeValidationError(
            'Name must be at least 3 characters long',
            'NAME_TOO_SHORT',
            { name, length: name.length }
        );
    }

    if (name.length > 255) {
        throw new IntakeValidationError(
            'Name cannot exceed 255 characters',
            'NAME_TOO_LONG',
            { name, length: name.length }
        );
    }
}

/**
 * Validates intake dates
 * @param startDate - The start date
 * @param endDate - The end date
 * @param deadline - The application deadline
 * @throws IntakeValidationError if validation fails
 */
export function validateIntakeDates(startDate: string, endDate: string, deadline: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const appDeadline = new Date(deadline);

    if (start >= end) {
        throw new IntakeValidationError(
            'Start date must be before end date',
            'INVALID_DATE_RANGE',
            { startDate, endDate }
        );
    }

    if (appDeadline >= start) {
        throw new IntakeValidationError(
            'Application deadline must be before start date',
            'INVALID_DEADLINE',
            { deadline, startDate }
        );
    }
}

/**
 * Validates intake capacity
 * @param capacity - The intake capacity to validate
 * @throws IntakeValidationError if validation fails
 */
export function validateIntakeCapacity(capacity: number): void {
    if (capacity <= 0) {
        throw new IntakeValidationError(
            'Capacity must be a positive number',
            'INVALID_CAPACITY',
            { capacity }
        );
    }

    if (capacity > 10000) {
        throw new IntakeValidationError(
            'Capacity cannot exceed 10,000',
            'CAPACITY_TOO_LARGE',
            { capacity }
        );
    }
}

/**
 * Validates intake data
 * @param data - The intake data to validate
 * @returns ValidationResult
 */
export function validateIntakeData(data: IntakeCreateData | IntakeUpdateData) {
    try {
        validateIntakeDates(data.start_date, data.end_date, data.end_date);
        validateIntakeCapacity(data.capacity ?? 0);
        return { success: true };
    } catch (error) {
        if (error instanceof IntakeValidationError) {
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
 * Intake constraint checking utilities
 */

/**
 * Checks if an intake can be deleted (no enrollments associated with it)
 * @param id - The intake ID to check
 * @returns Object with canDelete flag and enrollmentCount
 */
export async function checkIntakeConstraints(id: string): Promise<IntakeConstraintCheck> {
    try {
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(eq(enrollments.intake_id, id));

        return {
            canDelete: count === 0,
            enrollmentCount: count
        };
    } catch (error) {
        console.error('Error checking intake constraints:', error);
        // In case of error, assume it cannot be deleted for safety
        return {
            canDelete: false,
            enrollmentCount: 0
        };
    }
}

/**
 * Business rule enforcement utilities
 */

/**
 * Checks if intake status can be updated
 * @param currentStatus - Current intake status
 * @param newStatus - New intake status
 * @returns boolean indicating if update is allowed
 */
export function canUpdateIntakeStatus(currentStatus: boolean, newStatus: boolean): boolean {
    // For now, allow any status update
    // This could be extended with business rules if needed
    return true;
}

/**
 * Calculates available spots in an intake
 * @param capacity - The intake capacity
 * @param enrollmentCount - The current enrollment count
 * @returns number of available spots
 */
export function calculateAvailableSpots(capacity: number, enrollmentCount: number): number {
    return Math.max(0, capacity - enrollmentCount);
}