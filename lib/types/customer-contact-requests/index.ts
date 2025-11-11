import type { InferSelectModel } from 'drizzle-orm';
import type { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import type { CustomerContactReplyBase } from '@/lib/types';
import type { ColumnFiltersState } from '@tanstack/react-table';

// New status type
export type TypeContactRequestStatus = 'pending' | 'resolved' | 'closed';

// Base customer contact request types
export type CustomerContactRequestBase = InferSelectModel<
    typeof customerContactRequests
>;
export type CustomerContactRequestInsert =
    typeof customerContactRequests.$inferInsert;

// Comprehensive joined data types
export interface CustomerContactRequestWithDetails {
    request: CustomerContactRequestBase;
    replies: CustomerContactReplyBase[] | null;
}

// List view optimized type
export interface CustomerContactRequestListItem {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: TypeContactRequestStatus;
    created_at: string;
    updated_at: string;
    reply_count: number;
}

// Query parameter types
export interface CustomerContactRequestQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
    search?: string;
}

// Business operation types
export type CustomerContactRequestCreateData = Pick<
    CustomerContactRequestInsert,
    'name' | 'email' | 'phone' | 'message'
>;

export type CustomerContactRequestUpdateData =
    CustomerContactRequestCreateData & {
        id: string;
    };

// Constraint check result
export interface CustomerContactRequestConstraintCheck {
    canDelete: boolean;
}

// Status update types
export interface CustomerContactRequestStatusUpdate {
    id: string;
    status: TypeContactRequestStatus;
}
