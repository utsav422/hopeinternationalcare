// Comprehensive email service for Hope International
import {
    sendEmail,
    sendContactFormEmail,
    sendEnrollmentNotifications,
} from './resend';
import type { ContactFormData, EnrollmentNotificationData } from './resend';

// Email service class for centralized email management
export class EmailService {
    private static instance: EmailService;

    private constructor() {}

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    // Contact form emails
    async sendContactForm(data: ContactFormData) {
        return await sendContactFormEmail(data);
    }

    // Enrollment notification emails
    async sendEnrollmentNotification(data: EnrollmentNotificationData) {
        return await sendEnrollmentNotifications(data);
    }

    // Generic email sending
    async send({
        to,
        subject,
        html,
        text,
        from,
        replyTo,
    }: {
        to: string | string[];
        subject: string;
        html: string;
        text?: string;
        from?: string;
        replyTo?: string;
    }) {
        return await sendEmail({ to, subject, html, text, from, replyTo });
    }

    // Welcome email for new users
    async sendWelcomeEmail(userEmail: string, userName: string) {
        return await this.send({
            to: userEmail,
            subject: 'Welcome to Hope International!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Hope International!</h2>
          
          <p>Dear ${userName},</p>
          
          <p>Welcome to Hope International - your trusted partner in aged care training and elderly care services.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e293b;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Explore our comprehensive caregiver training courses</li>
              <li>Browse upcoming intake schedules</li>
              <li>Complete your profile for personalized recommendations</li>
              <li>Connect with our admissions team for guidance</li>
            </ul>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          Hope International Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Hope International - Aged Care Training and Elderly Care Center</p>
            <p>Kathmandu, Nepal</p>
          </div>
        </div>
      `,
        });
    }

    // Password reset email
    async sendPasswordResetEmail(userEmail: string, resetLink: string) {
        return await this.send({
            to: userEmail,
            subject: 'Reset Your Password - Hope International',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          
          <p>You have requested to reset your password for your Hope International account.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Security Notice:</strong> If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>This link will expire in 24 hours for security reasons.</p>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Hope International - Aged Care Training and Elderly Care Center</p>
            <p>Kathmandu, Nepal</p>
          </div>
        </div>
      `,
        });
    }

    // Course enrollment confirmation
    async sendEnrollmentConfirmation(
        userEmail: string,
        userName: string,
        courseName: string,
        intakeDate: string
    ) {
        return await this.send({
            to: userEmail,
            subject: 'Enrollment Confirmed - Hope International',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Enrollment Confirmed!</h2>
          
          <p>Dear ${userName},</p>
          
          <p>Congratulations! Your enrollment has been confirmed for the following course:</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin-top: 0; color: #1e293b;">Course Details</h3>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Intake Date:</strong> ${intakeDate}</p>
            <p><strong>Status:</strong> Confirmed</p>
          </div>
          
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #1e293b;">Next Steps</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>You will receive course materials and schedule details soon</li>
              <li>Please ensure you have completed all required documentation</li>
              <li>Arrive 15 minutes early on your first day</li>
              <li>Bring a valid ID and any required certificates</li>
            </ul>
          </div>
          
          <p>We look forward to welcoming you to Hope International!</p>
          
          <p>Best regards,<br>
          Hope International Admissions Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Hope International - Aged Care Training and Elderly Care Center</p>
            <p>Kathmandu, Nepal</p>
          </div>
        </div>
      `,
        });
    }

    // Course completion certificate email
    async sendCertificateEmail(
        userEmail: string,
        userName: string,
        courseName: string,
        certificateUrl?: string
    ) {
        return await this.send({
            to: userEmail,
            subject: 'Course Completion Certificate - Hope International',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Congratulations on Your Achievement!</h2>
          
          <p>Dear ${userName},</p>
          
          <p>Congratulations on successfully completing your course at Hope International!</p>
          
          <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
            <h3 style="margin-top: 0; color: #1e293b;">Course Completed</h3>
            <p><strong>Course:</strong> ${courseName}</p>
            <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> Certified</p>
          </div>
          
          ${
              certificateUrl
                  ? `
          <div style="margin: 30px 0; text-align: center;">
            <a href="${certificateUrl}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Download Certificate
            </a>
          </div>
          `
                  : ''
          }
          
          <p>Your dedication and hard work have paid off. This certification demonstrates your commitment to excellence in aged care.</p>
          
          <p>We wish you all the best in your career journey!</p>
          
          <p>Best regards,<br>
          Hope International Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>Hope International - Aged Care Training and Elderly Care Center</p>
            <p>Kathmandu, Nepal</p>
          </div>
        </div>
      `,
        });
    }
}

// Export singleton instance
export const emailService = EmailService.getInstance();

// Export types for convenience
export type { ContactFormData, EnrollmentNotificationData };
