import type { InferSelectModel } from 'drizzle-orm';
import type { profiles } from '@/lib/db/schema/profiles';
import type { authUsers } from 'drizzle-orm/supabase';
import type { EnrollmentBase, PaymentBase } from '@/lib/types';
import type { ColumnFiltersState } from '@tanstack/react-table';

// Base profile types
export type ProfileBase = InferSelectModel<typeof profiles>;
export type ProfileInsert = typeof profiles.$inferInsert;
export type UserBase = InferSelectModel<typeof authUsers>;

// Comprehensive joined data types
export interface ProfileWithDetails {
    profile: ProfileBase;
    user: UserBase | null;
    enrollments: EnrollmentBase[] | null;
    payments: PaymentBase[] | null;
}

// List view optimized type
export interface ProfileListItem {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
    enrollment_count: number;
    total_payments: number;
}

// Query parameter types
export interface ProfileQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
    search?: string;
}

// Business operation types
export type ProfileCreateData = Pick<
    ProfileInsert,
    'id' | 'full_name' | 'email' | 'phone' | 'role'
>;

export type ProfileUpdateData = Partial<
    Omit<ProfileCreateData, 'id' | 'email'>
> & {
    id: string;
};

// Constraint check result
export interface ProfileConstraintCheck {
    canDelete: boolean;
}
