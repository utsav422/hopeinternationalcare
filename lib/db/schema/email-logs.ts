import { pgTable, uuid, varchar, text, timestamp, jsonb, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import {serviceRole} from "drizzle-orm/supabase";

export const emailLogs = pgTable(
  'email_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Email details
    resend_email_id: varchar('resend_email_id', { length: 255 }), // ID from Resend API response
    batch_id: varchar('batch_id', { length: 255 }), // For batch emails, group them together
    
    // Email content
    from_email: varchar('from_email', { length: 255 }).notNull(),
    to_emails: jsonb('to_emails').notNull(), // Array of recipient emails
    subject: varchar('subject', { length: 500 }).notNull(),
    html_content: text('html_content'), // HTML content of the email
    text_content: text('text_content'), // Text content of the email
    reply_to: varchar('reply_to', { length: 255 }),
    
    // Email status and metadata
    status: varchar('status', { length: 50 }).default('sent').notNull(), // 'sent', 'delivered', 'bounced', 'failed', etc.
    email_type: varchar('email_type', { length: 100 }), // 'contact_form', 'enrollment', 'welcome', etc.
    template_used: varchar('template_used', { length: 100 }), // Template key if used
    
    // Response data from Resend
    resend_response: jsonb('resend_response'), // Full response from Resend API
    error_message: text('error_message'), // Error message if sending failed
    
    // Tracking
    sent_at: timestamp('sent_at', { mode: 'string' }).notNull().default(sql`now()`),
    delivered_at: timestamp('delivered_at', { mode: 'string' }),
    opened_at: timestamp('opened_at', { mode: 'string' }),
    clicked_at: timestamp('clicked_at', { mode: 'string' }),
    
    // Metadata
    user_id: uuid('user_id'), // User who triggered the email (if applicable)
    admin_id: uuid('admin_id'), // Admin who sent the email (if applicable)
    related_entity_type: varchar('related_entity_type', { length: 100 }), // 'contact_request', 'enrollment', etc.
    related_entity_id: uuid('related_entity_id'), // ID of the related entity
    
    // Timestamps
    created_at: timestamp('created_at', { mode: 'string' }).notNull().default(sql`now()`),
    updated_at: timestamp('updated_at', { mode: 'string' }).notNull().default(sql`now()`),
  },
  (_table) => [
    // Only admins can view email logs
    pgPolicy('admin can view all email logs', {
      as: 'permissive',
      for: 'select',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
    
    // Only system can insert email logs
    pgPolicy('system can insert email logs', {
      as: 'permissive',
      for: 'insert',
      to: serviceRole,
      withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
    
    // Only admins can update email logs (for status updates)
    pgPolicy('admin can update email logs', {
      as: 'permissive',
      for: 'update',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
      withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
    
    // Only admins can delete email logs
    pgPolicy('admin can delete email logs', {
      as: 'permissive',
      for: 'delete',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
  ]
);

export type EmailLog = typeof emailLogs.$inferSelect;
export type EmailLogInsert = typeof emailLogs.$inferInsert;
