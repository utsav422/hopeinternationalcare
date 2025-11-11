import { db } from '@/lib/db/drizzle';
import { intakes, courses } from '@/lib/db/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';

/**
 * Public intake validation utilities
 */

export class PublicIntakeValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'PublicIntakeValidationError';
    }
}

/**
 * Validates intake ID
 * @param id - The intake ID to validate
 * @throws PublicIntakeValidationError if validation fails
 */
export function validateIntakeId(id: string): void {
    if (!id || typeof id !== 'string') {
        throw new PublicIntakeValidationError(
            'Intake ID is required and must be a string',
            'INVALID_INTAKE_ID',
            { id }
        );
    }
}

/**
 * Validates course slug
 * @param slug - The course slug to validate
 * @throws PublicIntakeValidationError if validation fails
 */
export function validateCourseSlug(slug: string): void {
    if (!slug || typeof slug !== 'string') {
        throw new PublicIntakeValidationError(
            'Course slug is required and must be a string',
            'INVALID_COURSE_SLUG',
            { slug }
        );
    }
}

/**
 * Public intake business logic utilities
 */

/**
 * Checks if an intake is active (not ended yet)
 * @param endDate - The intake end date
 * @returns boolean indicating if intake is active
 */
export function isIntakeActive(endDate: string): boolean {
    const now = new Date();
    const end = new Date(endDate);
    return end >= now;
}

/**
 * Checks if an intake is open for enrollment
 * @param startDate - The intake start date
 * @param isOpen - Whether the intake is marked as open
 * @returns boolean indicating if intake is open
 */
export function isIntakeOpen(startDate: string, isOpen: boolean): boolean {
    const now = new Date();
    const start = new Date(startDate);
    return isOpen && start > now;
}

/**
 * Calculates seats remaining in an intake
 * @param capacity - The intake capacity
 * @param registered - The number of registered students
 * @returns Number of seats remaining
 */
export function calculateSeatsRemaining(
    capacity: number,
    registered: number
): number {
    return Math.max(0, capacity - registered);
}
