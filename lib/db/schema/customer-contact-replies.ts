import { pgTable, uuid, varchar, text, timestamp, jsonb, pgPolicy } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { serviceRole } from 'drizzle-orm/supabase';
import { customerContactRequests } from './customer-contact-requests';

export const customerContactReplies = pgTable(
  'customer_contact_replies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    
    // Reference to the original contact request
    contact_request_id: uuid('contact_request_id')
      .notNull()
      .references(() => customerContactRequests.id, { onDelete: 'cascade' }),
    
    // Reply details
    subject: varchar('subject', { length: 500 }).notNull(),
    message: text('message').notNull(),
    reply_to_email: varchar('reply_to_email', { length: 255 }).notNull(),
    reply_to_name: varchar('reply_to_name', { length: 255 }).notNull(),
    
    // Email sending details
    resend_email_id: varchar('resend_email_id', { length: 255 }), // ID from Resend API response
    email_status: varchar('email_status', { length: 50 }).default('sent').notNull(), // 'sent', 'delivered', 'bounced', 'failed'
    resend_response: jsonb('resend_response'), // Full response from Resend API
    error_message: text('error_message'), // Error message if sending failed
    
    // Batch information (if part of a batch reply)
    batch_id: varchar('batch_id', { length: 255 }), // Groups batch replies together
    is_batch_reply: varchar('is_batch_reply', { length: 10 }).default('false').notNull(), // 'true' or 'false'
    
    // Admin who sent the reply
    admin_id: uuid('admin_id'), // Admin user who sent the reply
    admin_email: varchar('admin_email', { length: 255 }), // Admin email for reference
    
    // Email tracking
    sent_at: timestamp('sent_at', { mode: 'string' }).notNull().default(sql`now()`),
    delivered_at: timestamp('delivered_at', { mode: 'string' }),
    opened_at: timestamp('opened_at', { mode: 'string' }),
    clicked_at: timestamp('clicked_at', { mode: 'string' }),
    
    // Timestamps
    created_at: timestamp('created_at', { mode: 'string' }).notNull().default(sql`now()`),
    updated_at: timestamp('updated_at', { mode: 'string' }).notNull().default(sql`now()`),
  },
  (_table) => [
    // RLS Policies for service_role
    
    // Service role can select all customer contact replies
    pgPolicy('service_role can select customer contact replies', {
      as: 'permissive',
      for: 'select',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
    
    // Service role can insert customer contact replies
    pgPolicy('service_role can insert customer contact replies', {
      as: 'permissive',
      for: 'insert',
      to: serviceRole,
      withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
    
    // Service role can update customer contact replies
    pgPolicy('service_role can update customer contact replies', {
      as: 'permissive',
      for: 'update',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
      withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
    
    // Service role can delete customer contact replies
    pgPolicy('service_role can delete customer contact replies', {
      as: 'permissive',
      for: 'delete',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
  ]
);

export type CustomerContactReply = typeof customerContactReplies.$inferSelect;
export type CustomerContactReplyInsert = typeof customerContactReplies.$inferInsert;
