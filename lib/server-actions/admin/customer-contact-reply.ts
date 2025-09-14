'use server';

import { z } from 'zod';
import { requireAdmin } from '@/utils/auth-guard';
import { sendEmail } from '@/lib/email/resend';
import { logger } from '@/utils/logger';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { customerContactReplies } from '@/lib/db/schema/customer-contact-replies';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import { createServerSupabaseClient } from '@/utils/supabase/server';

// Import schemas from Drizzle schema file
import {
  CustomerContactReplySchema,
  CustomerContactBatchReplySchema,
  CreateCustomerContactReplySchema,
  type CustomerContactReplyType,
  type CustomerContactBatchReplyType,
  type CreateCustomerContactReplyType,
} from '@/lib/db/drizzle-zod-schema/customer-contact-replies';

// Send single reply email
export async function sendCustomerContactReply(data: CustomerContactReplyType) {
  try {
    await requireAdmin();

    // Get current admin user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: 'Admin authentication required',
      };
    }

    // Validate input
    const parsed = CustomerContactReplySchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.message,
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

    // Save reply to database
    const replyData: CreateCustomerContactReplyType = {
      contact_request_id: contactRequestId,
      subject: `Re: ${subject}`,
      message,
      reply_to_email: replyToEmail,
      reply_to_name: replyToName,
      resend_email_id: emailResult.data?.id,
      email_status: 'sent',
      resend_response: {...(emailResult?.data) ??{}
        },
      is_batch_reply: 'false',
      admin_id: user.id,
      admin_email: user.email || undefined,
    };

    const savedReply = await db
      .insert(customerContactReplies)
      .values(replyData)
      .returning();

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
      replyId: savedReply[0]?.id,
    });

    revalidatePath('/admin/customer-contact-requests');

    return {
      success: true,
      data: {
        replyId: savedReply[0]?.id,
        emailId: emailResult.data?.id,
        recipientEmail: contactRequest.email,
        subject: `Re: ${subject}`,
        savedReply: savedReply[0],
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

    // Get current admin user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: 'Admin authentication required',
      };
    }

    // Validate input
    const parsed = CustomerContactBatchReplySchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.message,
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
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
          // Save reply to database
          const replyData: CreateCustomerContactReplyType = {
            contact_request_id: contactRequest.id,
            subject: `Re: ${subject}`,
            message,
            reply_to_email: contactRequest.email,
            reply_to_name: contactRequest.name,
            resend_email_id: emailResult.data?.id,
            email_status: 'sent',
            resend_response: {...(emailResult.data ?? {})
            },
            batch_id: batchId,
            is_batch_reply: 'true',
            admin_id: user.id,
            admin_email: user.email || undefined,
          };

          const savedReply = await db
            .insert(customerContactReplies)
            .values(replyData)
            .returning();

          results.push({
            contactRequestId: contactRequest.id,
            email: contactRequest.email,
            emailId: emailResult.data?.id,
            replyId: savedReply[0]?.id,
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
        batchId,
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

// Get customer contact replies with pagination
export async function adminCustomerContactRepliesList({
  page = 1,
  pageSize = 10,
  search,
  contactRequestId,
  batchId,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  contactRequestId?: string;
  batchId?: string;
} = {}) {
  try {
    await requireAdmin();

    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        sql`(${customerContactReplies.subject} ILIKE ${`%${search}%`} OR
            ${customerContactReplies.reply_to_email} ILIKE ${`%${search}%`} OR
            ${customerContactReplies.reply_to_name} ILIKE ${`%${search}%`})`
      );
    }

    if (contactRequestId) {
      whereConditions.push(eq(customerContactReplies.contact_request_id, contactRequestId));
    }

    if (batchId) {
      whereConditions.push(eq(customerContactReplies.batch_id, batchId));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(customerContactReplies)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Get paginated results with contact request details
    const replies = await db
      .select({
        reply: customerContactReplies,
        contactRequest: customerContactRequests,
      })
      .from(customerContactReplies)
      .leftJoin(
        customerContactRequests,
        eq(customerContactReplies.contact_request_id, customerContactRequests.id)
      )
      .where(whereClause)
      .orderBy(desc(customerContactReplies.created_at))
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      data: replies,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch customer contact replies:', {
      error: errorMessage,
      page,
      pageSize,
    });
    return {
      success: false,
      error: `Failed to fetch customer contact replies: ${errorMessage}`,
    };
  }
}

// Get customer contact reply by ID
export async function adminCustomerContactReplyById(id: string) {
  try {
    await requireAdmin();

    const reply = await db
      .select({
        reply: customerContactReplies,
        contactRequest: customerContactRequests,
      })
      .from(customerContactReplies)
      .leftJoin(
        customerContactRequests,
        eq(customerContactReplies.contact_request_id, customerContactRequests.id)
      )
      .where(eq(customerContactReplies.id, id))
      .limit(1);

    if (reply.length === 0) {
      return {
        success: false,
        error: 'Customer contact reply not found',
      };
    }

    return {
      success: true,
      data: reply[0],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch customer contact reply:', {
      error: errorMessage,
      replyId: id,
    });
    return {
      success: false,
      error: `Failed to fetch customer contact reply: ${errorMessage}`,
    };
  }
}

// Delete customer contact reply
export async function adminCustomerContactReplyDeleteById(id: string) {
  try {
    await requireAdmin();

    const result = await db
      .delete(customerContactReplies)
      .where(eq(customerContactReplies.id, id))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: 'Customer contact reply not found',
      };
    }

    logger.info('Customer contact reply deleted:', {
      replyId: id,
    });

    revalidatePath('/admin/customer-contact-requests');

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to delete customer contact reply:', {
      error: errorMessage,
      replyId: id,
    });
    return {
      success: false,
      error: `Failed to delete customer contact reply: ${errorMessage}`,
    };
  }
}
