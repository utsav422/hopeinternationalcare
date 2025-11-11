import { db } from '@/lib/db/drizzle';
import { enrollments, intakes, courses } from '@/lib/db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';
import { CreateEnrollmentData } from '@/lib/types/user/enrollments';

/**
 * User enrollment validation utilities
 */

export class UserEnrollmentValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'UserEnrollmentValidationError';
    }
}

/**
 * Validates enrollment creation data
 * @param data - The enrollment data to validate
 * @throws UserEnrollmentValidationError if validation fails
 */
export function validateEnrollmentData(data: CreateEnrollmentData): void {
    if (!data.courseId || typeof data.courseId !== 'string') {
        throw new UserEnrollmentValidationError(
            'Course ID is required and must be a string',
            'INVALID_COURSE_ID',
            { courseId: data.courseId }
        );
    }

    if (!data.intakeId || typeof data.intakeId !== 'string') {
        throw new UserEnrollmentValidationError(
            'Intake ID is required and must be a string',
            'INVALID_INTAKE_ID',
            { intakeId: data.intakeId }
        );
    }

    if (!data.userId || typeof data.userId !== 'string') {
        throw new UserEnrollmentValidationError(
            'User ID is required and must be a string',
            'INVALID_USER_ID',
            { userId: data.userId }
        );
    }
}

/**
 * User enrollment business logic utilities
 */

/**
 * Checks if a user is already enrolled in an intake
 * @param userId - The user ID
 * @param intakeId - The intake ID
 * @returns Promise<boolean> indicating if user is already enrolled
 */
export async function isUserAlreadyEnrolled(
    userId: string,
    intakeId: string
): Promise<boolean> {
    try {
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(
                and(
                    eq(enrollments.user_id, userId),
                    eq(enrollments.intake_id, intakeId)
                )
            );

        return count > 0;
    } catch (error) {
        console.error('Error checking enrollment status:', error);
        return false;
    }
}

/**
 * Checks if an intake has available capacity
 * @param intakeId - The intake ID
 * @returns Promise<{ hasCapacity: boolean, capacity: number, registered: number }> capacity information
 */
export async function checkIntakeCapacity(intakeId: string): Promise<{
    hasCapacity: boolean;
    capacity: number;
    registered: number;
}> {
    try {
        const [intake] = await db
            .select({
                capacity: intakes.capacity,
                total_registered: intakes.total_registered,
            })
            .from(intakes)
            .where(eq(intakes.id, intakeId))
            .limit(1);

        if (!intake) {
            return { hasCapacity: false, capacity: 0, registered: 0 };
        }

        return {
            hasCapacity: intake.total_registered < intake.capacity,
            capacity: intake.capacity,
            registered: intake.total_registered,
        };
    } catch (error) {
        console.error('Error checking intake capacity:', error);
        return { hasCapacity: false, capacity: 0, registered: 0 };
    }
}

/**
 * Calculates enrollment status based on payment status
 * @param hasPaid - Whether the user has paid
 * @returns Enrollment status string
 */
export function calculateEnrollmentStatus(hasPaid: boolean): string {
    return hasPaid ? 'confirmed' : 'requested';
}
