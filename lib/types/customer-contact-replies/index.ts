import type { InferSelectModel } from 'drizzle-orm';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type { customerContactReplies } from '@/lib/db/schema/customer-contact-replies';
import type { CustomerContactRequestBase } from '../customer-contact-requests';

// Base customer contact reply types
export type CustomerContactReplyBase = InferSelectModel<typeof customerContactReplies>;
export type CustomerContactReplyInsert = typeof customerContactReplies.$inferInsert;

// Related types
export type TypeCustomerContactReplyEmailStatus = 'sent' | 'delivered' | 'bounced' | 'failed';

// Comprehensive joined data types
export interface CustomerContactReplyWithDetails {
  reply: CustomerContactReplyBase;
  request: CustomerContactRequestBase | null;
}

// List view optimized type
export interface CustomerContactReplyListItem {
  id: string;
  subject: string;
  message: string;
  email_status: TypeCustomerContactReplyEmailStatus;
  created_at: string;
  updated_at: string;
  request: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Query parameter types
export interface CustomerContactReplyQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  filters?: ColumnFiltersState;
  search?: string;
}

// Business operation types
export type CustomerContactReplyCreateData = Pick<
    CustomerContactReplyInsert,
    'contact_request_id' | 'subject' | 'message' | 'reply_to_email' | 'reply_to_name' | 'admin_id' | 'admin_email'
>;

export type CustomerContactReplyUpdateData = Partial<Pick<CustomerContactReplyInsert, 'subject' | 'message'>> & {
  id: string;
};

// Constraint check result
export interface CustomerContactReplyConstraintCheck {
  canDelete: boolean;
}

// Status update types
export interface CustomerContactReplyStatusUpdate {
  id: string;
  email_status: TypeCustomerContactReplyEmailStatus;
  resend_email_id?: string | null;
  resend_response?: any;
  error_message?: string | null;
}

