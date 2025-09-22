import type { InferSelectModel } from 'drizzle-orm';
import type { payments } from '@/lib/db/schema/payments';
import type { EnrollmentBase, ProfileBase, CourseBase } from '@/lib/types';
import type { TypePaymentMethod, TypePaymentStatus } from '@/lib/db/schema/enums';
import type { ColumnFiltersState } from '@tanstack/react-table';

// Base payment types
export type PaymentBase = InferSelectModel<typeof payments>;
export type PaymentInsert = typeof payments.$inferInsert;

// Comprehensive joined data types
export interface PaymentWithDetails {
    payment: PaymentBase;
    enrollment: EnrollmentBase | null;
    user: ProfileBase | null;
    course: CourseBase | null;
}

// List view optimized type
export interface PaymentListItem {
    id: string;
    amount: number;
    status: TypePaymentStatus;
    method: TypePaymentMethod;
    created_at: string;
    updated_at: string;
    enrollment: {
        id: string;
        course_title: string;
        intake_id: string;
    } | null;
    user: {
        id: string;
        full_name: string;
        email: string;
    } | null;
}

// Query parameter types
export interface PaymentQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
    search?: string;
}

// Business operation types
export type PaymentCreateData = Pick<
    PaymentInsert,
    'enrollment_id' | 'amount' | 'status' | 'method' | 'remarks' | 'paid_at'
>;

export type PaymentUpdateData = Partial<Pick<PaymentInsert, 'status' | 'method' | 'remarks' | 'paid_at' | 'is_refunded' | 'refunded_at' | 'refunded_amount'>> & {
    id: string;
};

// Constraint check result
export interface PaymentConstraintCheck {
    canDelete: boolean;
}

// Status update types
export interface PaymentStatusUpdate {
    id: string;
    status: TypePaymentStatus;
    remarks?: string;
}

// Refund types
export interface PaymentRefundData {
    payment_id: string;
    amount: number;
    reason: string;
}
