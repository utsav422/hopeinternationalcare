import type { InferSelectModel } from 'drizzle-orm';
import type { courses } from '@/lib/db/schema/courses';
import type { AffiliationBase } from '../affiliations';
import type { CourseCategoryBase } from '../course-categories';
import type { IntakeBase } from '../intakes';
import type { ColumnFiltersState } from '@tanstack/react-table';
import type { TypeDurationType } from '@/lib/db/schema/enums';

// Base course types
export type CourseBase = InferSelectModel<typeof courses>;
export type CourseInsert = typeof courses.$inferInsert;

// Related types

// Comprehensive joined data types
export interface CourseWithDetails {
    course: CourseBase;
    category: CourseCategoryBase | null;
    affiliation: AffiliationBase | null;
    intakes: IntakeBase[] | null;
}

// List view optimized type
export interface CourseListItem {
    id: string;
    title: string;
    slug: string;
    price: number;
    level: number;
    image_url: string | null;
    duration_type: TypeDurationType;
    duration_value: number;
    created_at: string;
    updated_at: string;
    category_name: string | null;
    affiliation_name: string | null;
    intake_count: number;
    enrollment_count: number;
}

// Query parameter types
export interface CourseQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters: ColumnFiltersState;
    search?: string;
}

// Business operation types
export type CourseCreateData = Pick<
    CourseInsert,
    | 'category_id'
    | 'affiliation_id'
    | 'title'
    | 'slug'
    | 'courseHighlights'
    | 'courseOverview'
    | 'image_url'
    | 'level'
    | 'duration_type'
    | 'duration_value'
    | 'price'
>;

export type CourseUpdateData = CourseCreateData & {
    id: string;
};

// Constraint check result
export interface CourseConstraintCheck {
    canDelete: boolean;
    intakeCount: number;
    enrollmentCount: number;
}

// Image management types
export interface CourseImageUploadResult {
    url: string;
    key: string;
}
