// Email templates for Hope International
export const EMAIL_TEMPLATES = {
    // Base template wrapper
    base: (content: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hope International</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .button { background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .alert { padding: 15px; border-radius: 6px; margin: 15px 0; }
        .alert-info { background-color: #f0f9ff; border-left: 4px solid #2563eb; }
        .alert-success { background-color: #f0fdf4; border-left: 4px solid #16a34a; }
        .alert-warning { background-color: #fffbeb; border-left: 4px solid #f59e0b; }
        .alert-danger { background-color: #fef2f2; border-left: 4px solid #dc2626; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Hope International</h1>
          <p style="margin: 5px 0 0 0;">Aged Care Training & Elderly Care Center</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>Hope International</strong></p>
          <p>Kathmandu, Nepal</p>
          <p>Email: info@hopeinternational.com.np</p>
          <p>This email was sent from Hope International. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,

    // Contact form template
    contactForm: (data: {
        name: string;
        email: string;
        phone?: string;
        message: string;
    }) => `
    <h2 style="color: #2563eb;">New Contact Form Submission</h2>
    
    <div class="alert alert-info">
      <h3 style="margin-top: 0;">Contact Details</h3>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
    </div>
    
    <div class="alert alert-warning">
      <h3 style="margin-top: 0;">Message</h3>
      <p style="white-space: pre-wrap;">${data.message}</p>
    </div>
    
    <p><strong>Action Required:</strong> Please respond to this inquiry within 24 hours.</p>
    <p>Reply directly to this email to respond to ${data.name}.</p>
  `,

    // Welcome email template
    welcome: (userName: string) => `
    <h2 style="color: #2563eb;">Welcome to Hope International!</h2>
    
    <p>Dear ${userName},</p>
    
    <p>Welcome to Hope International - your trusted partner in aged care training and elderly care services.</p>
    
    <div class="alert alert-info">
      <h3 style="margin-top: 0;">What's Next?</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Explore our comprehensive caregiver training courses</li>
        <li>Browse upcoming intake schedules</li>
        <li>Complete your profile for personalized recommendations</li>
        <li>Connect with our admissions team for guidance</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/courses" class="button">
        Explore Courses
      </a>
    </div>
    
    <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
    
    <p>Best regards,<br>
    Hope International Team</p>
  `,

    // Enrollment request received template
    enrollmentReceived: (data: {
        userName: string;
        intakeId: string;
        courseName?: string;
    }) => `
    <h2 style="color: #2563eb;">Enrollment Request Received</h2>
    
    <p>Dear ${data.userName},</p>
    
    <p>Thank you for your interest in Hope International! We have received your enrollment request.</p>
    
    <div class="alert alert-info">
      <h3 style="margin-top: 0;">Enrollment Details</h3>
      <p><strong>Intake ID:</strong> ${data.intakeId}</p>
      ${data.courseName ? `<p><strong>Course:</strong> ${data.courseName}</p>` : ''}
      <p><strong>Status:</strong> Under Review</p>
    </div>
    
    <div class="alert alert-warning">
      <h3 style="margin-top: 0;">Next Steps</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Our admissions team will review your application</li>
        <li>You will be contacted within 2-3 business days</li>
        <li>Please ensure all required documents are ready</li>
        <li>Check your email regularly for updates</li>
      </ul>
    </div>
    
    <p>We appreciate your patience during the review process.</p>
    
    <p>Best regards,<br>
    Hope International Admissions Team</p>
  `,

    // Admin enrollment notification template
    enrollmentNotification: (data: {
        userName: string;
        userEmail: string;
        intakeId: string;
        courseName?: string;
    }) => `
    <h2 style="color: #dc2626;">New Enrollment Request</h2>
    
    <p>A new enrollment request has been submitted and requires your attention.</p>
    
    <div class="alert alert-danger">
      <h3 style="margin-top: 0;">Student Information</h3>
      <p><strong>Name:</strong> ${data.userName}</p>
      <p><strong>Email:</strong> ${data.userEmail}</p>
      <p><strong>Intake ID:</strong> ${data.intakeId}</p>
      ${data.courseName ? `<p><strong>Course:</strong> ${data.courseName}</p>` : ''}
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <p>Please log in to the admin panel to review and process this enrollment request.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/enrollments" class="button">
        View Enrollment Requests
      </a>
    </div>
    
    <p><strong>Action Required:</strong> Please review this request within 24 hours.</p>
  `,

    // Enrollment confirmation template
    enrollmentConfirmed: (data: {
        userName: string;
        courseName: string;
        intakeDate: string;
    }) => `
    <h2 style="color: #16a34a;">Enrollment Confirmed!</h2>
    
    <p>Dear ${data.userName},</p>
    
    <p>Congratulations! Your enrollment has been confirmed for the following course:</p>
    
    <div class="alert alert-success">
      <h3 style="margin-top: 0;">Course Details</h3>
      <p><strong>Course:</strong> ${data.courseName}</p>
      <p><strong>Intake Date:</strong> ${data.intakeDate}</p>
      <p><strong>Status:</strong> Confirmed</p>
    </div>
    
    <div class="alert alert-warning">
      <h3 style="margin-top: 0;">Important Information</h3>
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
  `,

    // Password reset template
    passwordReset: (resetLink: string) => `
    <h2 style="color: #2563eb;">Password Reset Request</h2>
    
    <p>You have requested to reset your password for your Hope International account.</p>
    
    <div class="alert alert-danger">
      <p><strong>Security Notice:</strong> If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="button">
        Reset Password
      </a>
    </div>
    
    <p>This link will expire in 24 hours for security reasons.</p>
    
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #2563eb; background-color: #f8fafc; padding: 10px; border-radius: 4px;">${resetLink}</p>
  `,

    // Course completion certificate template
    certificate: (data: {
        userName: string;
        courseName: string;
        certificateUrl?: string;
    }) => `
    <h2 style="color: #7c3aed;">Congratulations on Your Achievement!</h2>

    <p>Dear ${data.userName},</p>

    <p>Congratulations on successfully completing your course at Hope International!</p>

    <div class="alert alert-success">
      <h3 style="margin-top: 0;">Course Completed</h3>
      <p><strong>Course:</strong> ${data.courseName}</p>
      <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Status:</strong> Certified</p>
    </div>

    ${
        data.certificateUrl
            ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.certificateUrl}" class="button" style="background-color: #7c3aed;">
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
  `,

    // Account deletion notification template
    accountDeletionNotification: (data: {
        userName: string;
        deletionDate: string;
        reason: string;
        contactEmail: string;
    }) => `
    <h2 style="color: #dc2626;">Account Deletion Notification</h2>

    <p>Dear ${data.userName},</p>

    <p>We are writing to inform you that your Hope International account has been deactivated.</p>

    <div class="alert alert-danger">
      <h3 style="margin-top: 0;">Account Status</h3>
      <p><strong>Status:</strong> Deactivated</p>
      <p><strong>Deletion Date:</strong> ${data.deletionDate}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
    </div>

    <div class="alert alert-warning">
      <h3 style="margin-top: 0;">What This Means</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>You will no longer be able to access your account</li>
        <li>All active enrollments have been cancelled</li>
        <li>Your personal data will be handled according to our privacy policy</li>
        <li>Any pending payments or refunds will be processed separately</li>
      </ul>
    </div>

    <p>If you believe this action was taken in error or if you have any questions, please contact our support team immediately.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${data.contactEmail}" class="button" style="background-color: #dc2626;">
        Contact Support
      </a>
    </div>

    <p>Thank you for your understanding.</p>

    <p>Best regards,<br>
    Hope International Administration Team</p>
  `,

    // Scheduled deletion warning template
    accountDeletionScheduled: (data: {
        userName: string;
        scheduledDate: string;
        reason: string;
        contactEmail: string;
    }) => `
    <h2 style="color: #f59e0b;">Account Deletion Scheduled</h2>

    <p>Dear ${data.userName},</p>

    <p>This is an important notice regarding your Hope International account.</p>

    <div class="alert alert-warning">
      <h3 style="margin-top: 0;">Scheduled Deletion</h3>
      <p><strong>Your account is scheduled for deletion on:</strong> ${data.scheduledDate}</p>
      <p><strong>Reason:</strong> ${data.reason}</p>
      <p><strong>Time Zone:</strong> Nepal Standard Time (NPT)</p>
    </div>

    <div class="alert alert-danger">
      <h3 style="margin-top: 0;">Action Required</h3>
      <p>If you believe this action was scheduled in error, please contact our support team immediately. You have until the scheduled deletion date to resolve this matter.</p>
    </div>

    <div class="alert alert-info">
      <h3 style="margin-top: 0;">What Will Happen</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Your account will be permanently deactivated</li>
        <li>You will lose access to all courses and materials</li>
        <li>All active enrollments will be cancelled</li>
        <li>This action cannot be undone after the deletion date</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${data.contactEmail}" class="button" style="background-color: #f59e0b;">
        Contact Support Immediately
      </a>
    </div>

    <p><strong>Important:</strong> Please respond before ${data.scheduledDate} if you wish to prevent this action.</p>

    <p>Best regards,<br>
    Hope International Administration Team</p>
  `,

    // Deletion reminder template (24 hours before)
    accountDeletionReminder: (data: {
        userName: string;
        deletionDate: string;
        contactEmail: string;
    }) => `
    <h2 style="color: #dc2626;">Final Notice: Account Deletion in 24 Hours</h2>

    <p>Dear ${data.userName},</p>

    <p><strong>This is your final notice.</strong> Your Hope International account is scheduled for deletion in approximately 24 hours.</p>

    <div class="alert alert-danger">
      <h3 style="margin-top: 0;">Final Warning</h3>
      <p><strong>Deletion Date:</strong> ${data.deletionDate}</p>
      <p><strong>Time Remaining:</strong> Less than 24 hours</p>
      <p><strong>Action:</strong> Permanent account deactivation</p>
    </div>

    <p>If you need to prevent this action, you must contact our support team immediately.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${data.contactEmail}" class="button" style="background-color: #dc2626;">
        Contact Support Now
      </a>
    </div>

    <p><strong>After the deletion time, this action cannot be reversed.</strong></p>

    <p>Hope International Administration Team</p>
  `,

    // Account restored template
    accountRestored: (data: {
        userName: string;
        restorationDate: string;
        contactEmail: string;
    }) => `
    <h2 style="color: #16a34a;">Account Successfully Restored</h2>

    <p>Dear ${data.userName},</p>

    <p>Good news! Your Hope International account has been successfully restored and reactivated.</p>

    <div class="alert alert-success">
      <h3 style="margin-top: 0;">Account Status</h3>
      <p><strong>Status:</strong> Active</p>
      <p><strong>Restoration Date:</strong> ${data.restorationDate}</p>
      <p><strong>Access:</strong> Fully Restored</p>
    </div>

    <div class="alert alert-info">
      <h3 style="margin-top: 0;">What's Available</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Full access to your account and profile</li>
        <li>Access to all available courses and materials</li>
        <li>Ability to enroll in new courses</li>
        <li>All account features and services</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/sign-in" class="button">
        Sign In to Your Account
      </a>
    </div>

    <p>If you experience any issues accessing your account, please contact our support team.</p>

    <div style="text-align: center; margin: 20px 0;">
      <a href="mailto:${data.contactEmail}" style="color: #2563eb;">Contact Support</a>
    </div>

    <p>Welcome back to Hope International!</p>

    <p>Best regards,<br>
    Hope International Administration Team</p>
  `,
};

// Helper function to generate complete email HTML
export function generateEmailHTML(
    templateKey: keyof typeof EMAIL_TEMPLATES,
    ...args: any[]
): string {
    const template = EMAIL_TEMPLATES[templateKey];
    if (templateKey === 'base') {
        return template(args[0]);
    }
    const content = (template as any)(...args);
    return EMAIL_TEMPLATES.base(content);
}

// Email subject templates
export const EMAIL_SUBJECTS = {
    contactForm: (name: string) => `New Contact Form Message from ${name}`,
    welcome: 'Welcome to Hope International!',
    enrollmentReceived: 'Enrollment Request Received - Hope International',
    enrollmentNotification: 'New Enrollment Request - Hope International',
    enrollmentConfirmed: 'Enrollment Confirmed - Hope International',
    passwordReset: 'Reset Your Password - Hope International',
    certificate: 'Course Completion Certificate - Hope International',
    accountDeletionNotification: 'Account Deactivated - Hope International',
    accountDeletionScheduled:
        'Important: Account Deletion Scheduled - Hope International',
    accountDeletionReminder:
        'Final Notice: Account Deletion in 24 Hours - Hope International',
    accountRestored: 'Account Restored - Hope International',
};
