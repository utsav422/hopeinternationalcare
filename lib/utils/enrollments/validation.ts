import { type TypeEnrollmentStatus } from '@/lib/db/schema/enums';
import {
    type EnrollmentWithDetails,
    type EnrollmentCreateData,
    EnrollmentValidationError,
} from '@/lib/types/enrollments';

/**
 * Validates enrollment status transitions
 * @param from Current status
 * @param to New status
 * @throws EnrollmentValidationError if transition is invalid
 */
export function validateEnrollmentStatusTransition(
    from: TypeEnrollmentStatus,
    to: TypeEnrollmentStatus
): void {
    const validTransitions: Record<
        TypeEnrollmentStatus,
        TypeEnrollmentStatus[]
    > = {
        requested: ['enrolled', 'cancelled'],
        enrolled: ['completed', 'cancelled'],
        completed: [], // No transitions from completed
        cancelled: ['requested'], // Allow re-enrollment
    };

    if (!validTransitions[from]?.includes(to)) {
        throw new EnrollmentValidationError(
            `Invalid status transition from ${from} to ${to}`,
            'INVALID_STATUS_TRANSITION',
            { from, to, validTransitions: validTransitions[from] }
        );
    }
}

/**
 * Validates enrollment creation data
 * @param data Enrollment creation data
 * @throws EnrollmentValidationError if data is invalid
 */
export function validateEnrollmentCreation(data: EnrollmentCreateData): void {
    const errors: string[] = [];

    if (!data.user_id) {
        errors.push('User ID is required');
    }

    if (!data.intake_id) {
        errors.push('Intake ID is required');
    }

    if (errors.length > 0) {
        throw new EnrollmentValidationError(
            'Invalid enrollment creation data',
            'INVALID_CREATION_DATA',
            { errors }
        );
    }
}

/**
 * Validates enrollment operation based on business rules
 * @param operation Type of operation
 * @param data Data for the operation
 * @param existing Existing enrollment (for update operations)
 */
export function validateEnrollmentOperation(
    operation: 'create' | 'update' | 'delete',
    data: any,
    existing?: EnrollmentWithDetails
): void {
    switch (operation) {
        case 'create':
            validateEnrollmentCreation(data);
            break;
        case 'update':
            if (!existing) {
                throw new EnrollmentValidationError(
                    'Existing enrollment data is required for update operations',
                    'MISSING_ENROLLMENT_DATA'
                );
            }
            break;
        case 'delete':
            if (!existing) {
                throw new EnrollmentValidationError(
                    'Existing enrollment data is required for delete operations',
                    'MISSING_ENROLLMENT_DATA'
                );
            }
            // Check if enrollment can be deleted based on status
            if (existing.enrollment.status === 'completed') {
                throw new EnrollmentValidationError(
                    'Cannot delete completed enrollments',
                    'CANNOT_DELETE_COMPLETED'
                );
            }
            break;
    }
}

/**
 * Validates enrollment capacity constraints
 * @param currentCapacity Current number of enrolled users
 * @param maxCapacity Maximum capacity of the intake
 * @throws EnrollmentValidationError if capacity is exceeded
 */
export function validateEnrollmentCapacity(
    currentCapacity: number,
    maxCapacity: number | null
): void {
    if (maxCapacity !== null && currentCapacity >= maxCapacity) {
        throw new EnrollmentValidationError(
            'Intake capacity exceeded',
            'CAPACITY_EXCEEDED',
            { currentCapacity, maxCapacity }
        );
    }
}
