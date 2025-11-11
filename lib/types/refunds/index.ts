import type { InferSelectModel } from 'drizzle-orm';
import type { refunds } from '@/lib/db/schema/refunds';
import type { PaymentBase, ProfileBase } from '@/lib/types';
import type { ColumnFiltersState } from '@tanstack/react-table';

// Base refund types
export type RefundBase = InferSelectModel<typeof refunds>;
export type RefundInsert = typeof refunds.$inferInsert;

// Comprehensive joined data types
export interface RefundWithDetails {
    refund: RefundBase;
    payment: PaymentBase | null;
    user: ProfileBase | null;
}

// List view optimized type
export interface RefundListItem {
    id: string;
    payment_id: string;
    amount: number;
    reason: string;
    created_at: string;
    updated_at: string;
    payment: {
        id: string;
    } | null;
    user: {
        id: string;
        full_name: string;
        email: string;
    } | null;
}

// Query parameter types
export interface RefundQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
    search?: string;
}

// Business operation types
export type RefundCreateData = Pick<
    RefundInsert,
    'payment_id' | 'enrollment_id' | 'user_id' | 'reason' | 'amount'
>;
export type RefundUpdateData = Partial<
    Omit<RefundInsert, 'user_id' | 'created_at' | 'updated_at'>
>;
// Constraint check result
export interface RefundConstraintCheck {
    canDelete: boolean;
}
