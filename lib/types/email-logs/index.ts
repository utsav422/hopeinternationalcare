import type { InferSelectModel } from 'drizzle-orm';
import type { emailLogs } from '@/lib/db/schema/email-logs';
import type { ColumnFiltersState } from '@tanstack/react-table';

// New status type
export type TypeEmailStatus = 'sent' | 'delivered' | 'bounced' | 'failed';

// Base email log types
export type EmailLogBase = InferSelectModel<typeof emailLogs>;
export type EmailLogInsert = typeof emailLogs.$inferInsert;

// List view optimized type
export interface EmailLogListItem {
  id: string;
  to_emails: string[];
  subject: string;
  status: TypeEmailStatus;
  email_type: string | null;
  sent_at: string | null;
  created_at: string;
  error_message: string | null;
}

// Query parameter types
export interface EmailLogQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  filters?: ColumnFiltersState;
  search?: string;
}

// Business operation types
export type EmailLogCreateData = Pick<
  EmailLogInsert,
  |
'from_email'
  | 'to_emails'
  | 'subject'
  | 'html_content'
  | 'text_content'
  | 'status'
  | 'email_type'
  | 'user_id'
  | 'admin_id'
  | 'related_entity_type'
  | 'related_entity_id'
>;

export type EmailLogUpdateData = Partial<Omit<EmailLogCreateData, 'from_email' | 'to_emails'>> & {
  id: string;
};

// Constraint check result
export interface EmailLogConstraintCheck {
  canDelete: boolean;
}

// Status update types
export interface EmailLogStatusUpdate {
  id: string;
  status: TypeEmailStatus;
  error_message?: string | null;
  resend_email_id?: string | null;
  resend_response?: any;
}
