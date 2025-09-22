import { db } from '@/lib/db/drizzle';
import { intakes } from '@/lib/db/schema/intakes';
import { eq, sql } from 'drizzle-orm';
import { EnrollmentBusinessError } from '@/lib/types/enrollments';
import { logger } from '@/utils/logger';
import { PaymentStatus, TypePaymentStatus } from '@/lib/db/schema';

/**
 * Updates intake capacity when enrollments are created or deleted
 * @param intakeId Intake ID
 * @param operation Operation type (increment or decrement)
 */
export async function updateIntakeCapacity(
    intakeId: string,
    operation: 'increment' | 'decrement'
): Promise<void> {
    try {
        if (operation === 'increment') {
            await db
                .update(intakes)
                .set({
                    total_registered: sql`${intakes.total_registered} + 1`
                })
                .where(eq(intakes.id, intakeId));
        } else if (operation === 'decrement') {
            await db
                .update(intakes)
                .set({
                    total_registered: sql`${intakes.total_registered} - 1`
                })
                .where(eq(intakes.id, intakeId));
        }
    } catch (error) {
        logger.error('Error updating intake capacity', {
            error: error instanceof Error ? error.message : 'Unknown error',
            intakeId,
            operation
        });
        throw new EnrollmentBusinessError(
            'Failed to update intake capacity',
            'CAPACITY_UPDATE_FAILED',
            { intakeId, operation }
        );
    }
}

/**
 * Validates and updates intake capacity for a new enrollment
 * @param intakeId Intake ID
 */
export async function validateAndIncrementCapacity(intakeId: string): Promise<void> {
    try {
        // Fetch current intake details
        const intakeResult = await db
            .select({
                id: intakes.id,
                capacity: intakes.capacity,
                total_registered: intakes.total_registered
            })
            .from(intakes)
            .where(eq(intakes.id, intakeId))
            .limit(1);

        if (intakeResult.length === 0) {
            throw new EnrollmentBusinessError(
                'Intake not found',
                'INTAKE_NOT_FOUND',
                { intakeId }
            );
        }

        const intake = intakeResult[0];

        // Check if capacity is exceeded
        if (
            intake.capacity !== null &&
            intake.total_registered >= intake.capacity
        ) {
            throw new EnrollmentBusinessError(
                'Intake capacity exceeded',
                'CAPACITY_EXCEEDED',
                {
                    current: intake.total_registered,
                    max: intake.capacity
                }
            );
        }

        // Increment capacity
        await updateIntakeCapacity(intakeId, 'increment');
    } catch (error) {
        if (error instanceof EnrollmentBusinessError) {
            throw error;
        }
        logger.error('Error validating and incrementing capacity', {
            error: error instanceof Error ? error.message : 'Unknown error',
            intakeId
        });
        throw new EnrollmentBusinessError(
            'Failed to validate and update intake capacity',
            'VALIDATION_FAILED',
            { intakeId }
        );
    }
}

/**
 * Synchronizes enrollment payment status with enrollment status
 * @param enrollmentId Enrollment ID
 * @param enrollmentStatus New enrollment status
 */
export async function syncEnrollmentPaymentStatus(
    enrollmentId: string,
    enrollmentStatus: string
): Promise<void> {
    try {
        // Import payments schema here to avoid circular dependencies
        const { payments } = await import('@/lib/db/schema/payments');
        const { eq } = await import('drizzle-orm');

        let newPaymentStatus: TypePaymentStatus

        switch (enrollmentStatus) {
            case 'enrolled':
            case 'completed':
                newPaymentStatus = PaymentStatus.completed
                break;
            case 'cancelled':
                newPaymentStatus = PaymentStatus.cancelled;
                break;
            case 'failed':
                newPaymentStatus = PaymentStatus.failed;
                break;
            case 'refunded':
                newPaymentStatus = PaymentStatus.refunded;
                break;
            case 'pending':
                newPaymentStatus = PaymentStatus.pending;
                break;
            default:
                // do not change payment status for other enrollment statuses
                return;
        }

        if (newPaymentStatus) {
            await db
                .update(payments)
                .set({ status: newPaymentStatus })
                .where(eq(payments.enrollment_id, enrollmentId));
        }
    } catch (error) {
        logger.error('Error synchronizing enrollment payment status', {
            error: error instanceof Error ? error.message : 'Unknown error',
            enrollmentId,
            enrollmentStatus
        });
        // Don't fail the enrollment update if payment sync fails, just log the error
    }
}