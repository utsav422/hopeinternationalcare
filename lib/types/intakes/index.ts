import type { InferSelectModel } from 'drizzle-orm';
import type { intakes } from '@/lib/db/schema/intakes';
import type { CourseBase, EnrollmentBase } from '@/lib/types';
import type { ColumnFiltersState } from '@tanstack/react-table';

// Base intake types
export type IntakeBase = InferSelectModel<typeof intakes>;
export type IntakeInsert = typeof intakes.$inferInsert;

// Comprehensive joined data types
export interface IntakeWithDetails {
    intake: IntakeBase;
    course: CourseBase | null;
    enrollments: EnrollmentBase[] | null;
}

// List view optimized type
export interface IntakeListItem {
    id: string;
    start_date: string;
    end_date: string;
    capacity: number;
    is_open: boolean | null;
    created_at: string;
    updated_at: string;
    course: {
        id: string;
        title: string;
        price: number;
    } | null;
    enrollment_count: number;
    available_spots: number;
}

// Query parameter types
export interface IntakeQueryParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
    search?: string;
}

// Business operation types
export type IntakeCreateData = Pick<
    IntakeInsert,
    'course_id' | 'start_date' | 'end_date' | 'capacity' | 'is_open'
>;

export type IntakeUpdateData = IntakeCreateData & {
    id: string;
};

// Constraint check result
export interface IntakeConstraintCheck {
    canDelete: boolean;
    enrollmentCount: number;
}

// Status update types
export interface IntakeStatusUpdate {
    id: string;
    is_open: boolean;
}

// Additional types for compatibility methods
export type IntakeWithCourse = {
    id: string;
    course_id: string | null;
    coursePrice: number | undefined;
    courseTitle: string | undefined;
    start_date: string;
    end_date: string;
    capacity: number;
    total_registered: number;
    is_open: boolean | null;
    created_at: string;
};

export type IntakeGenerationResult = {
    success: boolean;
    data?: any[];
    error?: string;
    message?: string;
    generatedCount?: number;
    existingCount?: number;
    totalCount?: number;
};

export type ListParams = {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: any[];
};

// Metadata type for adminIntakesByCourseAndYear function
export interface IntakesByCourseAndYearMetadata {
    total: number;
    courseId: string | null;
    courseTitle: string;
    year: number;
    totalIntakes: number;
    openIntakes: number;
    totalRegistered: number;
    utilizationRate: number;
    coursePrice: number;
}

// Response type for adminIntakesByCourseAndYear function
export interface IntakesByCourseAndYearResponse {
    intakes: Array<{
        id: string;
        start_date: string;
        end_date: string;
        capacity: number;
        is_open: boolean | null;
        created_at: string;
        updated_at: string;
        course: {
            id: string;
            title: string;
            price: number;
        } | null;
        enrollment_count: number;
        available_spots: number;
    }>;
    metadata: IntakesByCourseAndYearMetadata;
}
