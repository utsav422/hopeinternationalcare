import type { InferSelectModel } from 'drizzle-orm';
import type { courseCategories } from '@/lib/db/schema/course-categories';
import type { CourseBase } from '../courses';
import type { ColumnFiltersState } from '@tanstack/react-table';

// Base course category types
export type CourseCategoryBase = InferSelectModel<typeof courseCategories>;
export type CourseCategoryInsert = typeof courseCategories.$inferInsert;

// Comprehensive joined data types
export interface CourseCategoryWithDetails {
    category: CourseCategoryBase;
    courses: CourseBase[] | null;
}

// List view optimized type
export interface CourseCategoryListItem {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    course_count: number;
}

// Query parameter types
export interface CourseCategoryQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
    search?: string;
}

// Business operation types
export type CourseCategoryCreateData = Pick<
    CourseCategoryInsert,
    'name' | 'description'
>;

export type CourseCategoryUpdateData = CourseCategoryCreateData & {
    id: string;
};

// Constraint check result
export interface CourseCategoryConstraintCheck {
    canDelete: boolean;
    courseCount: number;
}
