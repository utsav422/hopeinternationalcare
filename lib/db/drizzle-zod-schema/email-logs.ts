import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { emailLogs } from '../schema/email-logs';

export const ZodEmailLogInsertSchema = createInsertSchema(emailLogs, {
  to_emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
  from_email: z.string().email('Invalid from email address'),
  subject: z.string().min(1, 'Subject is required'),
  status: z.enum(['sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked']).default('sent'),
  email_type: z.string().optional(),
  template_used: z.string().optional(),
});

export const ZodEmailLogSelectSchema = createSelectSchema(emailLogs);

export type ZodEmailLogInsertType = z.infer<typeof ZodEmailLogInsertSchema>;
export type ZodEmailLogSelectType = z.infer<typeof ZodEmailLogSelectSchema>;

// Schema for creating email log entries
export const CreateEmailLogSchema = z.object({
  resend_email_id: z.string().optional(),
  batch_id: z.string().optional(),
  from_email: z.string().email('Invalid from email address'),
  to_emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  html_content: z.string().optional(),
  text_content: z.string().optional(),
  reply_to: z.string().email('Invalid reply-to email address').optional(),
  status: z.enum(['sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked']).default('sent'),
  email_type: z.string().optional(),
  template_used: z.string().optional(),
  resend_response: z.record(z.any()).optional(),
  error_message: z.string().optional(),
  user_id: z.string().uuid('Invalid user ID').optional(),
  admin_id: z.string().uuid('Invalid admin ID').optional(),
  related_entity_type: z.string().optional(),
  related_entity_id: z.string().uuid('Invalid entity ID').optional(),
});

export type CreateEmailLogType = z.infer<typeof CreateEmailLogSchema>;

// Schema for updating email log status
export const UpdateEmailLogStatusSchema = z.object({
  id: z.string().uuid('Invalid email log ID'),
  status: z.enum(['sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked']),
  delivered_at: z.string().datetime().optional(),
  opened_at: z.string().datetime().optional(),
  clicked_at: z.string().datetime().optional(),
  error_message: z.string().optional(),
});

export type UpdateEmailLogStatusType = z.infer<typeof UpdateEmailLogStatusSchema>;
