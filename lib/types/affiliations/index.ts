import type { InferSelectModel } from 'drizzle-orm';
import type { affiliations } from '@/lib/db/schema/affiliations';
import { CourseBase } from '../courses';
import type { ColumnFiltersState } from '@tanstack/react-table';

// Base affiliation types
export type AffiliationBase = InferSelectModel<typeof affiliations>;
export type AffiliationInsert = typeof affiliations.$inferInsert;

// Comprehensive joined data types
export interface AffiliationWithDetails {
    affiliation: AffiliationBase;
    courses: CourseBase[] | null;
}

// List view optimized type
export type AffiliationListItem = Omit<AffiliationBase, 'created_at' | 'updated_at'> & {
    created_at: string;
    updated_at: string;
    course_count: number;
};

// Query parameter types
export interface AffiliationQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
    search?: string;
}

// Business operation types
export type AffiliationCreateData = Pick<
    AffiliationInsert,
    'name' | 'type' | 'description'
>;

export type AffiliationUpdateData = AffiliationCreateData & {
    id: string;
};

// Constraint check result
export interface AffiliationConstraintCheck {
    canDelete: boolean;
    courseCount: number;
}
