// Resend email utility for Hope International
import { Resend } from 'resend';
import { generateEmailHTML, EMAIL_SUBJECTS } from './templates';
import { logger } from '@/utils/logger';
import { adminEmailLogCreate } from '@/lib/server-actions/admin/email-logs-optimized';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Validate configuration on module load
if (!process.env.RESEND_API_KEY) {
    console.warn(
        'RESEND_API_KEY is not configured. Email functionality will not work.'
    );
}

if (!process.env.RESEND_FROM_EMAIL) {
    console.warn(
        'RESEND_FROM_EMAIL is not configured. Using default email address.'
    );
}

// Default email configuration
const DEFAULT_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || 'noreply@hopeinternational.com.np';
const DEFAULT_TO_EMAIL =
    process.env.RESEND_TO_EMAIL || 'info@hopeinternational.com.np';

// Email templates and types
export interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

export interface EnrollmentNotificationData {
    userEmail: string;
    userName: string;
    intakeId: string;
    courseName?: string;
    adminEmails: string[];
}

// Contact form email
export async function sendContactFormEmail(data: ContactFormData) {
    try {
        // Validate required fields
        if (!data.name || !data.email || !data.message) {
            throw new Error(
                'Missing required fields: name, email, and message are required'
            );
        }

        // Validate email format
        if (!validateEmail(data.email)) {
            throw new Error('Invalid email format');
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            throw new Error('Email service is not properly configured');
        }

        const { name, email, phone, message } = data;

        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [DEFAULT_TO_EMAIL],
            replyTo: email,
            subject: EMAIL_SUBJECTS.contactForm(name),
            html: generateEmailHTML('contactForm', {
                name,
                email,
                phone,
                message,
            }),
            text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}

Message:
${message}

---
This email was sent from the Hope International contact form.
Reply directly to this email to respond to ${name}.
      `,
        });

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to send email';
        logger.error('Failed to send contact form email:', {
            error: errorMessage,
            email: data.email,
            name: data.name,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Enrollment notification emails
export async function sendEnrollmentNotifications(
    data: EnrollmentNotificationData
) {
    try {
        // Validate required fields
        if (
            !data.userEmail ||
            !data.userName ||
            !data.intakeId ||
            !data.adminEmails?.length
        ) {
            throw new Error(
                'Missing required fields: userEmail, userName, intakeId, and adminEmails are required'
            );
        }

        // Validate email formats
        if (!validateEmail(data.userEmail)) {
            throw new Error('Invalid user email format');
        }

        for (const adminEmail of data.adminEmails) {
            if (!validateEmail(adminEmail)) {
                throw new Error(`Invalid admin email format: ${adminEmail}`);
            }
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            throw new Error('Email service is not properly configured');
        }

        const { userEmail, userName, intakeId, courseName, adminEmails } = data;

        // Send confirmation email to user
        const userEmailResult = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.enrollmentReceived,
            html: generateEmailHTML('enrollmentReceived', {
                userName,
                intakeId,
                courseName,
            }),
        });

        // Send notification email to admins
        const adminEmailResult = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: adminEmails,
            subject: EMAIL_SUBJECTS.enrollmentNotification,
            html: generateEmailHTML('enrollmentNotification', {
                userName,
                userEmail,
                intakeId,
                courseName,
            }),
        });

        return {
            success: true,
            data: {
                userEmail: userEmailResult,
                adminEmail: adminEmailResult,
            },
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send notifications';
        logger.error('Failed to send enrollment notifications:', {
            error: errorMessage,
            userEmail: data.userEmail,
            userName: data.userName,
            intakeId: data.intakeId,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Generic email sending function
export async function sendEmail({
    to,
    subject,
    html,
    text,
    from = DEFAULT_FROM_EMAIL,
    replyTo,
}: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    from?: string;
    replyTo?: string;
}) {
    try {
        const emailData = await resend.emails.send({
            from,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
            replyTo,
        });
        if (emailData?.error?.message) {
            return { success: false, error: emailData?.error?.message };
        }
        // Log the email
        try {
            await adminEmailLogCreate({
                resend_email_id: emailData?.data?.id,
                from_email: from,
                to_emails: Array.isArray(to) ? to : [to],
                subject,
                html_content: html,
                text_content: text,
                reply_to: replyTo,
                status: 'sent',
                email_type: 'generic',
                resend_response: emailData,
            });
        } catch (logError) {
            // Don't fail the email send if logging fails
            logger.error('Failed to log email:', { error: logError });
        }

        return {
            success: true,
            data: emailData.data,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to send email';
        logger.error('Failed to send email:', {
            error: errorMessage,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Email validation utility
export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if Resend is properly configured
export function isResendConfigured(): boolean {
    return !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

// Batch email interface
export interface BatchEmailData {
    to: string;
    subject: string;
    html: string;
    text: string;
    from?: string;
    replyTo?: string;
}

// Send batch emails (up to 100 emails)
export async function sendBatchEmails(emails: BatchEmailData[]) {
    try {
        // Validate batch size
        if (emails.length === 0) {
            return { success: false, error: 'No emails provided' };
        }

        if (emails.length > 100) {
            return {
                success: false,
                error: 'Maximum 100 emails allowed per batch',
            };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }

        // Validate each email
        for (const email of emails) {
            if (!email.to || !email.subject) {
                return {
                    success: false,
                    error: 'Each email must have "to" and "subject" fields',
                };
            }

            if (!validateEmail(email.to)) {
                return {
                    success: false,
                    error: `Invalid email format: ${email.to}`,
                };
            }
        }

        // Prepare batch data for Resend API
        const batchData = emails.map(email => ({
            from: email.from || DEFAULT_FROM_EMAIL,
            to: [email.to],
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: email.replyTo,
        }));

        // Send batch emails using Resend batch API
        const batchResult = await resend.batch.send(batchData);

        // Log batch emails
        const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            if (batchResult.data?.data.length === emails.length) {
                for (let i = 0; i < emails.length; i++) {
                    const email = emails[i];
                    const result = batchResult.data.data[i];

                    await adminEmailLogCreate({
                        resend_email_id: result?.id,
                        batch_id: batchId,
                        from_email: email.from || DEFAULT_FROM_EMAIL,
                        to_emails: [email.to],
                        subject: email.subject,
                        html_content: email.html,
                        text_content: email.text,
                        reply_to: email.replyTo,
                        status: 'sent',
                        email_type: 'batch',
                        resend_response: result,
                    });
                }
            }
        } catch (logError) {
            // Don't fail the batch send if logging fails
            logger.error('Failed to log batch emails:', { error: logError });
        }

        logger.info('Batch emails sent successfully:', {
            totalEmails: emails.length,
            batchId: batchResult.data?.data?.map(item => item.id).join(', '),
        });

        return {
            success: true,
            data: {
                results: batchResult.data,
                totalSent: emails.length,
                emailIds: batchResult.data?.data?.map(item => item.id) || [],
                batchId,
            },
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send batch emails';
        logger.error('Failed to send batch emails:', {
            error: errorMessage,
            totalEmails: emails.length,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send batch emails with template
export async function sendBatchEmailsWithTemplate(
    recipients: Array<{
        email: string;
        name?: string;
        data?: Record<string, any>;
    }>,
    templateKey: keyof typeof import('./templates').EMAIL_TEMPLATES,
    subject: string,
    templateData?: Record<string, any>
) {
    try {
        // Validate inputs
        if (recipients.length === 0) {
            throw new Error('No recipients provided');
        }

        if (recipients.length > 100) {
            throw new Error('Maximum 100 recipients allowed per batch');
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            throw new Error('Email service is not properly configured');
        }

        // Prepare batch emails
        const batchEmails: BatchEmailData[] = recipients.map(recipient => {
            // Validate email
            if (!validateEmail(recipient.email)) {
                throw new Error(`Invalid email format: ${recipient.email}`);
            }

            // Merge template data with recipient-specific data
            const mergedData = {
                ...templateData,
                ...recipient.data,
                name: recipient.name,
            };

            return {
                to: recipient.email,
                subject,
                text: generateEmailHTML(templateKey, mergedData),
                html: generateEmailHTML(templateKey, mergedData),
            };
        });

        // Send batch emails
        const result = await sendBatchEmails(batchEmails);

        if (result.success) {
            logger.info('Batch template emails sent successfully:', {
                templateKey,
                totalRecipients: recipients.length,
                subject,
            });
        }

        return result;
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send batch template emails';
        logger.error('Failed to send batch template emails:', {
            error: errorMessage,
            templateKey,
            totalRecipients: recipients.length,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Retrieve email by ID
export async function getEmailById(emailId: string) {
    try {
        // Validate email ID
        if (!emailId) {
            return { success: false, error: 'Email ID is required' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }

        // Retrieve email using Resend API
        const emailData = await resend.emails.get(emailId);

        if (emailData?.error?.message) {
            return { success: false, error: emailData?.error?.message };
        }
        logger.info('Email retrieved successfully:', {
            emailId,
            subject: emailData.data?.subject,
        });

        return {
            success: true,
            data: emailData.data,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Failed to retrieve email';
        logger.error('Failed to retrieve email:', {
            error: errorMessage,
            emailId,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Get email status by ID
export async function getEmailStatus(emailId: string) {
    try {
        const result = await getEmailById(emailId);

        if (!result.success || !result.data || result.error) {
            return result;
        }

        return {
            success: true,
            data: {
                id: result?.data?.id,
                status: result.data?.last_event,
                created_at: result.data?.created_at,
                from: result?.data?.from,
                to: result?.data?.to,
                subject: result?.data?.subject,
            },
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to get email status';
        logger.error('Failed to get email status:', {
            error: errorMessage,
            emailId,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send welcome email to new users
export async function sendWelcomeEmail(userEmail: string, userName: string) {
    try {
        // Validate required fields
        if (!userEmail || !userName) {
            return {
                success: false,
                error: 'Missing required fields: userEmail and userName are required',
            };
        }

        // Validate email format
        if (!validateEmail(userEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }
        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.welcome,
            html: generateEmailHTML('welcome', userName),
        });

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send welcome email';
        logger.error('Failed to send welcome email:', {
            error: errorMessage,
            userEmail,
            userName,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send enrollment confirmation email
export async function sendEnrollmentConfirmation(
    userEmail: string,
    userName: string,
    courseName: string,
    intakeDate: string
) {
    try {
        // Validate required fields
        if (!userEmail || !userName || !courseName || !intakeDate) {
            return {
                success: false,
                error: 'Missing required fields: userEmail, userName, courseName, and intakeDate are required',
            };
        }

        // Validate email format
        if (!validateEmail(userEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }
        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.enrollmentConfirmed,
            html: generateEmailHTML('enrollmentConfirmed', {
                userName,
                courseName,
                intakeDate,
            }),
        });

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send enrollment confirmation';
        logger.error('Failed to send enrollment confirmation:', {
            error: errorMessage,
            userEmail,
            userName,
            courseName,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send password reset email
export async function sendPasswordResetEmail(
    userEmail: string,
    resetLink: string
) {
    try {
        // Validate required fields
        if (!userEmail || !resetLink) {
            return {
                success: false,
                error: 'Missing required fields: userEmail and resetLink are required',
            };
        }

        // Validate email format
        if (!validateEmail(userEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Validate reset link format
        if (!resetLink.startsWith('http')) {
            return { success: false, error: 'Invalid reset link format' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }
        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.passwordReset,
            html: generateEmailHTML('passwordReset', resetLink),
        });

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send password reset email';
        logger.error('Failed to send password reset email:', {
            error: errorMessage,
            userEmail,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send course completion certificate email
export async function sendCertificateEmail(
    userEmail: string,
    userName: string,
    courseName: string,
    certificateUrl?: string
) {
    try {
        // Validate required fields
        if (!userEmail || !userName || !courseName) {
            return {
                success: false,
                error: 'Missing required fields: userEmail, userName, and courseName are required',
            };
        }

        // Validate email format
        if (!validateEmail(userEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Validate certificate URL if provided
        if (certificateUrl && !certificateUrl.startsWith('http')) {
            return { success: false, error: 'Invalid certificate URL format' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }
        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.certificate,
            html: generateEmailHTML('certificate', {
                userName,
                courseName,
                certificateUrl,
            }),
        });

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send certificate email';
        logger.error('Failed to send certificate email:', {
            error: errorMessage,
            userEmail,
            userName,
            courseName,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send user deletion notification email
export async function sendUserDeletionNotification(
    userEmail: string,
    templateData: {
        userName: string;
        deletionDate: string;
        reason: string;
        contactEmail: string;
    }
) {
    try {
        // Validate required fields
        if (
            !userEmail ||
            !templateData.userName ||
            !templateData.deletionDate ||
            !templateData.reason
        ) {
            return {
                success: false,
                error: 'Missing required fields for deletion notification',
            };
        }

        // Validate email format
        if (!validateEmail(userEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }

        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.accountDeletionNotification,
            html: generateEmailHTML(
                'accountDeletionNotification',
                templateData
            ),
        });

        // Log the email
        try {
            await adminEmailLogCreate({
                resend_email_id: emailData?.data?.id,
                from_email: DEFAULT_FROM_EMAIL,
                to_emails: [userEmail],
                subject: EMAIL_SUBJECTS.accountDeletionNotification,
                html_content: generateEmailHTML(
                    'accountDeletionNotification',
                    templateData
                ),
                status: 'sent',
                email_type: 'user_deletion',
                template_used: 'accountDeletionNotification',
                resend_response: emailData,
            });
        } catch (logError) {
            logger.error('Failed to log deletion notification email:', {
                error: logError,
            });
        }

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send deletion notification';
        logger.error('Failed to send deletion notification:', {
            error: errorMessage,
            userEmail,
            userName: templateData.userName,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send scheduled deletion warning email
export async function sendScheduledDeletionWarning(
    userEmail: string,
    templateData: {
        userName: string;
        scheduledDate: string;
        reason: string;
        contactEmail: string;
    }
) {
    try {
        // Validate required fields
        if (
            !userEmail ||
            !templateData.userName ||
            !templateData.scheduledDate ||
            !templateData.reason
        ) {
            return {
                success: false,
                error: 'Missing required fields for scheduled deletion warning',
            };
        }

        // Validate email format
        if (!validateEmail(userEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }

        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.accountDeletionScheduled,
            html: generateEmailHTML('accountDeletionScheduled', templateData),
        });

        // Log the email
        try {
            await adminEmailLogCreate({
                resend_email_id: emailData?.data?.id,
                from_email: DEFAULT_FROM_EMAIL,
                to_emails: [userEmail],
                subject: EMAIL_SUBJECTS.accountDeletionScheduled,
                html_content: generateEmailHTML(
                    'accountDeletionScheduled',
                    templateData
                ),
                status: 'sent',
                email_type: 'scheduled_deletion_warning',
                template_used: 'accountDeletionScheduled',
                resend_response: emailData,
            });
        } catch (logError) {
            logger.error('Failed to log scheduled deletion warning email:', {
                error: logError,
            });
        }

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send scheduled deletion warning';
        logger.error('Failed to send scheduled deletion warning:', {
            error: errorMessage,
            userEmail,
            userName: templateData.userName,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send deletion reminder email (24 hours before)
export async function sendDeletionReminder(
    userEmail: string,
    templateData: {
        userName: string;
        deletionDate: string;
        contactEmail: string;
    }
) {
    try {
        // Validate required fields
        if (
            !userEmail ||
            !templateData.userName ||
            !templateData.deletionDate
        ) {
            return {
                success: false,
                error: 'Missing required fields for deletion reminder',
            };
        }

        // Validate email format
        if (!validateEmail(userEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }

        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.accountDeletionReminder,
            html: generateEmailHTML('accountDeletionReminder', templateData),
        });

        // Log the email
        try {
            await adminEmailLogCreate({
                resend_email_id: emailData?.data?.id,
                from_email: DEFAULT_FROM_EMAIL,
                to_emails: [userEmail],
                subject: EMAIL_SUBJECTS.accountDeletionReminder,
                html_content: generateEmailHTML(
                    'accountDeletionReminder',
                    templateData
                ),
                status: 'sent',
                email_type: 'deletion_reminder',
                template_used: 'accountDeletionReminder',
                resend_response: emailData,
            });
        } catch (logError) {
            logger.error('Failed to log deletion reminder email:', {
                error: logError,
            });
        }

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send deletion reminder';
        logger.error('Failed to send deletion reminder:', {
            error: errorMessage,
            userEmail,
            userName: templateData.userName,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Send account restoration confirmation email
export async function sendRestorationConfirmation(
    userEmail: string,
    templateData: {
        userName: string;
        restorationDate: string;
        contactEmail: string;
    }
) {
    try {
        // Validate required fields
        if (
            !userEmail ||
            !templateData.userName ||
            !templateData.restorationDate
        ) {
            return {
                success: false,
                error: 'Missing required fields for restoration confirmation',
            };
        }

        // Validate email format
        if (!validateEmail(userEmail)) {
            return { success: false, error: 'Invalid email format' };
        }

        // Check if Resend is configured
        if (!isResendConfigured()) {
            return {
                success: false,
                error: 'Email service is not properly configured',
            };
        }

        const emailData = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [userEmail],
            subject: EMAIL_SUBJECTS.accountRestored,
            html: generateEmailHTML('accountRestored', templateData),
        });

        // Log the email
        try {
            await adminEmailLogCreate({
                resend_email_id: emailData?.data?.id,
                from_email: DEFAULT_FROM_EMAIL,
                to_emails: [userEmail],
                subject: EMAIL_SUBJECTS.accountRestored,
                html_content: generateEmailHTML(
                    'accountRestored',
                    templateData
                ),
                status: 'sent',
                email_type: 'account_restoration',
                template_used: 'accountRestored',
                resend_response: emailData,
            });
        } catch (logError) {
            logger.error('Failed to log restoration confirmation email:', {
                error: logError,
            });
        }

        return {
            success: true,
            data: emailData,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : 'Failed to send restoration confirmation';
        logger.error('Failed to send restoration confirmation:', {
            error: errorMessage,
            userEmail,
            userName: templateData.userName,
        });
        return {
            success: false,
            error: errorMessage,
        };
    }
}
