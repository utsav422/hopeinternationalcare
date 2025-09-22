import { PaymentBase } from '@/lib/types';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type { TypeEnrollmentStatus, TypePaymentStatus } from '@/lib/db/schema/enums';
import type { enrollments } from '@/lib/db/schema/enrollments';
import { ProfileBase } from '../profiles';
import { IntakeBase } from '../intakes';
import { CourseBase } from '../courses';
import { CourseCategoryBase } from '../course-categories';

// Export the enum types
export type { TypeEnrollmentStatus, TypePaymentStatus };

// Base enrollment types
export type EnrollmentBase = typeof enrollments.$inferSelect;
export type EnrollmentInsert = typeof enrollments.$inferInsert;


// Comprehensive joined data types
export interface EnrollmentWithDetails {
    enrollment: EnrollmentBase;
    user: ProfileBase | null;
    intake: IntakeBase | null;
    course: CourseBase | null;
    category: CourseCategoryBase | null;
    payment: PaymentBase | null;
}

// List view optimized type
export interface EnrollmentListItem {
    id: string;
    status: TypeEnrollmentStatus;
    created_at: string;
    notes: string | null;
    user: {
        id: string;
        fullName: string | null;
        email: string | null;
    };
    course: {
        id: string;
        title: string | null;
        price: number | null;
    };
    intake: {
        id: string;
        start_date: string | null;
        end_date: string | null;
    };
    payment: {
        id: string | null;
        status: TypePaymentStatus | null;
        amount: number | null;
    };
}

// Query parameter types
export interface EnrollmentQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
    status?: TypeEnrollmentStatus;
    userId?: string;
}

// Business operation types
export interface EnrollmentStatusUpdate {
    id: string;
    status: TypeEnrollmentStatus;
    cancelled_reason?: string;
    notify_user?: boolean;
}

export interface EnrollmentCreateData {
    user_id: string;
    intake_id: string;
    status?: TypeEnrollmentStatus;
    notes?: string;
}

// Bulk operations
export interface EnrollmentBulkStatusUpdate {
    ids: string[];
    status: TypeEnrollmentStatus;
    cancelled_reason?: string;
}

// Validation result type
export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
    details?: Record<string, any>;
}

// Custom error types
export class EnrollmentValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'EnrollmentValidationError';
    }
}

export class EnrollmentBusinessError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'EnrollmentBusinessError';
    }
}