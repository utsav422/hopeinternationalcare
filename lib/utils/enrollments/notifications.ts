import {
    type EnrollmentWithDetails,
    type TypeEnrollmentStatus,
} from '@/lib/types/enrollments';
import { emailService } from '@/lib/email/service';
import { logger } from '@/utils/logger';

/**
 * Handles enrollment status notification emails
 * @param enrollment Enrollment with details
 * @param previousStatus Previous enrollment status
 * @param newStatus New enrollment status
 * @param reason Cancellation reason (if applicable)
 */
export async function handleEnrollmentStatusNotification(
    enrollment: EnrollmentWithDetails,
    previousStatus: TypeEnrollmentStatus,
    newStatus: TypeEnrollmentStatus,
    reason?: string
): Promise<void> {
    // Only send email if status actually changed
    if (previousStatus === newStatus) {
        logger.info('No email sent - enrollment status unchanged', {
            enrollmentId: enrollment.enrollment.id,
            status: newStatus,
        });
        return;
    }

    const userEmail = enrollment.user?.email;
    const userName = enrollment.user?.full_name;
    const courseTitle = enrollment.course?.title;

    // Check if we have required data to send email
    if (!userEmail || !userName || !courseTitle) {
        logger.warn('Missing required data for enrollment notification', {
            enrollmentId: enrollment.enrollment.id,
            hasUserEmail: !!userEmail,
            hasUserName: !!userName,
            hasCourseTitle: !!courseTitle,
        });
        return;
    }

    try {
        let emailResult;

        switch (newStatus) {
            case 'enrolled':
                // Send enrollment confirmation email
                emailResult = await emailService.sendEnrollmentConfirmation(
                    userEmail,
                    userName,
                    courseTitle,
                    enrollment.intake?.start_date || ''
                );
                logger.info('Enrollment confirmation email sent', {
                    userEmail,
                    userName,
                    courseName: courseTitle,
                    previousStatus,
                    newStatus,
                });
                break;

            case 'cancelled':
                // Send enrollment cancellation email
                emailResult = await emailService.send({
                    to: userEmail,
                    subject: 'Enrollment Cancelled - Hope International',
                    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Enrollment Cancelled</h2>
              
              <p>Dear ${userName},</p>
              
              <p>We regret to inform you that your enrollment has been cancelled.</p>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #1e293b;">Cancellation Details</h3>
                <p><strong>Course:</strong> ${courseTitle}</p>
                <p><strong>Status:</strong> Cancelled</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>
              
              <p>If you have any questions about this cancellation, please contact our admissions team.</p>
              
              <p>Best regards,<br>
              Hope International Admissions Team</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
                <p>Hope International - Aged Care Training and Elderly Care Center</p>
                <p>Kathmandu, Nepal</p>
              </div>
            </div>
          `,
                });
                logger.info('Enrollment cancellation email sent', {
                    userEmail,
                    userName,
                    courseName: courseTitle,
                    cancellationReason: reason,
                    previousStatus,
                    newStatus,
                });
                break;

            case 'completed':
                // Send course completion email with certificate
                emailResult = await emailService.sendCertificateEmail(
                    userEmail,
                    userName,
                    courseTitle
                );
                logger.info('Course completion email sent', {
                    userEmail,
                    userName,
                    courseName: courseTitle,
                    previousStatus,
                    newStatus,
                });
                break;

            default:
                logger.info('No notification required for status change', {
                    enrollmentId: enrollment.enrollment.id,
                    previousStatus,
                    newStatus,
                });
                return;
        }

        if (emailResult && !emailResult.success) {
            logger.error('Failed to send enrollment status change email', {
                error: emailResult.error,
            });
        }
    } catch (error) {
        logger.error('Error sending enrollment status change email', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        // Don't fail the status update if email fails, just log the error
    }
}

/**
 * Sends bulk enrollment notifications
 * @param enrollments Array of enrollments with details
 * @param status New status for all enrollments
 */
export async function sendBulkEnrollmentNotifications(
    enrollments: EnrollmentWithDetails[],
    status: TypeEnrollmentStatus
): Promise<void> {
    for (const enrollment of enrollments) {
        // For bulk operations, we'll use the current status as "previous" since we don't have individual previous states
        await handleEnrollmentStatusNotification(
            enrollment,
            enrollment.enrollment.status,
            status
        );
    }
}
