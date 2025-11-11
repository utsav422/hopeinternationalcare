import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { customerContactReplies } from '../schema/customer-contact-replies';

export const ZodCustomerContactReplyInsertSchema = createInsertSchema(
    customerContactReplies,
    {
        contact_request_id: z.string().uuid('Invalid contact request ID'),
        subject: z
            .string()
            .min(1, 'Subject is required')
            .max(500, 'Subject too long'),
        message: z.string().min(1, 'Message is required'),
        reply_to_email: z.string().email('Invalid email address'),
        reply_to_name: z
            .string()
            .min(1, 'Name is required')
            .max(255, 'Name too long'),
        email_status: z
            .enum([
                'sent',
                'delivered',
                'bounced',
                'failed',
                'opened',
                'clicked',
            ])
            .default('sent'),
        is_batch_reply: z.enum(['true', 'false']).default('false'),
        admin_email: z.string().email('Invalid admin email address').optional(),
    }
);

export const ZodCustomerContactReplySelectSchema = createSelectSchema(
    customerContactReplies
);

export type ZodCustomerContactReplyInsertType = z.infer<
    typeof ZodCustomerContactReplyInsertSchema
>;
export type ZodCustomerContactReplySelectType = z.infer<
    typeof ZodCustomerContactReplySelectSchema
>;

// Schema for single reply (API input)
export const CustomerContactReplySchema = z.object({
    contactRequestId: z.string().uuid('Invalid contact request ID'),
    subject: z
        .string()
        .min(1, 'Subject is required')
        .max(500, 'Subject too long'),
    message: z.string().min(1, 'Message is required'),
    replyToEmail: z.string().email('Invalid email address'),
    replyToName: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name too long'),
});

// Schema for batch reply (API input)
export const CustomerContactBatchReplySchema = z.object({
    contactRequestIds: z
        .array(z.string().uuid('Invalid contact request ID'))
        .min(1, 'At least one contact request is required')
        .max(100, 'Maximum 100 recipients allowed'),
    subject: z
        .string()
        .min(1, 'Subject is required')
        .max(500, 'Subject too long'),
    message: z.string().min(1, 'Message is required'),
});

export type CustomerContactReplyType = z.infer<
    typeof CustomerContactReplySchema
>;
export type CustomerContactBatchReplyType = z.infer<
    typeof CustomerContactBatchReplySchema
>;

// Schema for creating database records
export const CreateCustomerContactReplySchema = z.object({
    contact_request_id: z.string().uuid('Invalid contact request ID'),
    subject: z
        .string()
        .min(1, 'Subject is required')
        .max(500, 'Subject too long'),
    message: z.string().min(1, 'Message is required'),
    reply_to_email: z.string().email('Invalid email address'),
    reply_to_name: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name too long'),
    resend_email_id: z.string().optional(),
    email_status: z
        .enum(['sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked'])
        .default('sent'),
    resend_response: z.record(z.any(), z.any()).optional(),
    error_message: z.string().optional(),
    batch_id: z.string().optional(),
    is_batch_reply: z.enum(['true', 'false']).default('false'),
    admin_id: z.string().uuid('Invalid admin ID').optional(),
    admin_email: z.string().email('Invalid admin email address').optional(),
});

export type CreateCustomerContactReplyType = z.infer<
    typeof CreateCustomerContactReplySchema
>;

// Schema for updating reply status
export const UpdateCustomerContactReplyStatusSchema = z.object({
    id: z.string().uuid('Invalid reply ID'),
    email_status: z.enum([
        'sent',
        'delivered',
        'bounced',
        'failed',
        'opened',
        'clicked',
    ]),
    delivered_at: z.string().datetime().optional(),
    opened_at: z.string().datetime().optional(),
    clicked_at: z.string().datetime().optional(),
    error_message: z.string().optional(),
});

export type UpdateCustomerContactReplyStatusType = z.infer<
    typeof UpdateCustomerContactReplyStatusSchema
>;
