'use server';

import { z } from 'zod';
import { requireAdmin } from '@/utils/auth-guard';
import { sendEmail } from '@/lib/email/resend';
import { logger } from '@/utils/logger';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { eq } from 'drizzle-orm';

// Schema for single reply
export const CustomerContactReplySchema = z.object({
  contactRequestId: z.string().uuid('Invalid contact request ID'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
  replyToEmail: z.string().email('Invalid email address'),
  replyToName: z.string().min(1, 'Name is required'),
});

// Schema for batch reply
export const CustomerContactBatchReplySchema = z.object({
  contactRequestIds: z.array(z.string().uuid()).min(1, 'At least one contact request is required').max(100, 'Maximum 100 recipients allowed'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export type CustomerContactReplyType = z.infer<typeof CustomerContactReplySchema>;
export type CustomerContactBatchReplyType = z.infer<typeof CustomerContactBatchReplySchema>;

// Send single reply email
export async function sendCustomerContactReply(data: CustomerContactReplyType) {
  try {
    await requireAdmin();

    // Validate input
    const parsed = CustomerContactReplySchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map(e => e.message).join(', '),
      };
    }

    const { contactRequestId, subject, message, replyToEmail, replyToName } = parsed.data;

    // Get contact request details
    const contactRequest = await db.query.customerContactRequests.findFirst({
      where: eq(customerContactRequests.id, contactRequestId),
    });

    if (!contactRequest) {
      return {
        success: false,
        error: 'Contact request not found',
      };
    }

    // Send reply email
    const emailResult = await sendEmail({
      to: contactRequest.email,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Reply from Hope International</h2>
          
          <p>Dear ${contactRequest.name},</p>
          
          <p>Thank you for contacting Hope International. We have received your message and are pleased to respond.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Your Original Message:</h3>
            <p style="font-style: italic; color: #64748b;">"${contactRequest.message}"</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e293b;">Our Response:</h3>
            <div style="white-space: pre-wrap;">${message}</div>
          </div>
          
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          Hope International Team</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p><strong>Hope International</strong></p>
            <p>Aged Care Training & Elderly Care Center</p>
            <p>Kathmandu, Nepal</p>
            <p>Email: info@hopeinternational.com.np</p>
          </div>
        </div>
      `,
      text: `
Reply from Hope International

Dear ${contactRequest.name},

Thank you for contacting Hope International. We have received your message and are pleased to respond.

Your Original Message:
"${contactRequest.message}"

Our Response:
${message}

If you have any further questions, please don't hesitate to contact us.

Best regards,
Hope International Team

---
Hope International
Aged Care Training & Elderly Care Center
Kathmandu, Nepal
Email: info@hopeinternational.com.np
      `,
    });

    if (!emailResult.success) {
      logger.error('Failed to send customer contact reply:', {
        contactRequestId,
        error: emailResult.error,
        recipientEmail: contactRequest.email,
      });
      return {
        success: false,
        error: `Failed to send email: ${emailResult.error}`,
      };
    }

    // Update contact request status to 'resolved'
    await db
      .update(customerContactRequests)
      .set({ 
        status: 'resolved',
        updated_at: new Date().toISOString(),
      })
      .where(eq(customerContactRequests.id, contactRequestId));

    logger.info('Customer contact reply sent successfully:', {
      contactRequestId,
      recipientEmail: contactRequest.email,
      subject,
    });

    revalidatePath('/admin/customer-contact-requests');

    return {
      success: true,
      data: {
        emailId: emailResult.data?.id,
        recipientEmail: contactRequest.email,
        subject: `Re: ${subject}`,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error sending customer contact reply:', {
      error: errorMessage,
      contactRequestId: data.contactRequestId,
    });
    return {
      success: false,
      error: `Failed to send reply: ${errorMessage}`,
    };
  }
}

// Send batch reply emails
export async function sendCustomerContactBatchReply(data: CustomerContactBatchReplyType) {
  try {
    await requireAdmin();

    // Validate input
    const parsed = CustomerContactBatchReplySchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map(e => e.message).join(', '),
      };
    }

    const { contactRequestIds, subject, message } = parsed.data;

    // Get all contact requests
    const contactRequests = await db.query.customerContactRequests.findMany({
      where: (customerContactRequests, { inArray }) => 
        inArray(customerContactRequests.id, contactRequestIds),
    });

    if (contactRequests.length === 0) {
      return {
        success: false,
        error: 'No valid contact requests found',
      };
    }

    const results = [];
    const errors = [];

    // Send emails to each contact request
    for (const contactRequest of contactRequests) {
      try {
        const emailResult = await sendEmail({
          to: contactRequest.email,
          subject: `Re: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Reply from Hope International</h2>
              
              <p>Dear ${contactRequest.name},</p>
              
              <p>Thank you for contacting Hope International. We have received your message and are pleased to respond.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e293b;">Your Original Message:</h3>
                <p style="font-style: italic; color: #64748b;">"${contactRequest.message}"</p>
              </div>
              
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                <h3 style="margin-top: 0; color: #1e293b;">Our Response:</h3>
                <div style="white-space: pre-wrap;">${message}</div>
              </div>
              
              <p>If you have any further questions, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>
              Hope International Team</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
                <p><strong>Hope International</strong></p>
                <p>Aged Care Training & Elderly Care Center</p>
                <p>Kathmandu, Nepal</p>
                <p>Email: info@hopeinternational.com.np</p>
              </div>
            </div>
          `,
        });

        if (emailResult.success) {
          results.push({
            contactRequestId: contactRequest.id,
            email: contactRequest.email,
            emailId: emailResult.data?.id,
            success: true,
          });

          // Update status to resolved
          await db
            .update(customerContactRequests)
            .set({ 
              status: 'resolved',
              updated_at: new Date().toISOString(),
            })
            .where(eq(customerContactRequests.id, contactRequest.id));
        } else {
          errors.push({
            contactRequestId: contactRequest.id,
            email: contactRequest.email,
            error: emailResult.error,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({
          contactRequestId: contactRequest.id,
          email: contactRequest.email,
          error: errorMessage,
        });
      }
    }

    logger.info('Batch customer contact reply completed:', {
      totalRequests: contactRequests.length,
      successful: results.length,
      failed: errors.length,
      subject,
    });

    revalidatePath('/admin/customer-contact-requests');

    return {
      success: true,
      data: {
        successful: results,
        failed: errors,
        totalSent: results.length,
        totalFailed: errors.length,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error sending batch customer contact reply:', {
      error: errorMessage,
      contactRequestIds: data.contactRequestIds,
    });
    return {
      success: false,
      error: `Failed to send batch reply: ${errorMessage}`,
    };
  }
}
