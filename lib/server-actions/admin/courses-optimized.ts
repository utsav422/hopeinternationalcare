'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { courses } from '@/lib/db/schema/courses';
import type { InferInsertModel } from 'drizzle-orm';
import type { courses as coursesTable } from '@/lib/db/schema/courses';
import { courseCategories } from '@/lib/db/schema/course-categories';
import { affiliations } from '@/lib/db/schema/affiliations';
import { intakes } from '@/lib/db/schema/intakes';
import { enrollments } from '@/lib/db/schema/enrollments';
import { requireAdmin } from '@/lib/middleware/auth-guard';
import { logger } from '@/lib/utils/logger';
import {
    CourseListItem,
    CourseWithDetails,
    CourseQueryParams,
    CourseCreateData,
    CourseUpdateData,
    CourseConstraintCheck,
    CourseImageUploadResult,
    CourseBase,
} from '@/lib/types/courses';
import {
    validateCourseData,
    checkCourseConstraints,
    uploadCourseImage,
    deleteCourseImage,
    CourseValidationError
} from '@/lib/utils/courses/index';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import { ApiResponse } from '@/lib/types';
import { DurationType, durationType, TypeDurationType } from '@/lib/db/schema';
import { duration } from 'drizzle-orm/gel-core';

// Column mappings for courses
const courseColumnMap = {
    id: courses.id,
    title: courses.title,
    slug: courses.slug,
    price: courses.price,
    level: courses.level,
    duration_type: courses.duration_type,
    duration_value: courses.duration_value,
    created_at: courses.created_at,
    updated_at: courses.updated_at,
    category_name: courseCategories.name,
    affiliation_name: affiliations.name,
};

/**
 * Error handling utility
 */
export function handleCourseError(error: unknown, operation: string): ApiResponse<never> {
    if (error instanceof CourseValidationError) {
        const validationError = error as CourseValidationError;
        return {
            success: false,
            error: validationError.message,
            code: validationError.code,
            details: validationError.details
        };
    }

    if (error instanceof Error) {
        logger.error(`Course ${operation} failed:`, error);
        return {
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR'
        };
    }

    logger.error(`Unexpected error in course ${operation}:`, {error});
    return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
    };
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminCourseList(params: CourseQueryParams): Promise<ApiResponse<{
    data: CourseListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    try {
        await requireAdmin();

        const {
            page = 1,
            pageSize = 10,
            sortBy = 'created_at',
            order = 'desc',
            filters = [],
            search
        } = params;

        const offset = (page - 1) * pageSize;

        // Build filter conditions
        const filterConditions = buildFilterConditions(filters, courseColumnMap);

        // Add search condition if provided
        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(
                sql`(${courses.title} ILIKE ${searchFilter} OR ${courses.slug} ILIKE ${searchFilter})`
            );
        }
        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, courseColumnMap);

        // Main query with filters, pagination, and joins
        const query = db
            .select({
                id: courses.id,
                title: courses.title,
                slug: courses.slug,
                price: courses.price,
                level: courses.level,
                duration_type: courses.duration_type,
                duration_value: courses.duration_value,
                created_at: courses.created_at,
                updated_at: courses.updated_at,
                category: {
                    id: courseCategories.id,
                    name: courseCategories.name,
                },
                affiliation: {
                    id: affiliations.id,
                    name: affiliations.name,
                },
                intake_count: sql<number>`count(intakes.id)`,
                enrollment_count: sql<number>`count(enrollments.id)`,
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .leftJoin(affiliations, eq(courses.affiliation_id, affiliations.id))
            .leftJoin(intakes, eq(courses.id, intakes.course_id))
            .leftJoin(enrollments, eq(intakes.id, enrollments.intake_id))
            .groupBy(
                courses.id,
                courses.title,
                courses.slug,
                courses.price,
                courses.level,
                courses.duration_type,
                courses.duration_value,
                courses.created_at,
                courses.updated_at,
                courseCategories.id,
                courseCategories.name,
                affiliations.id,
                affiliations.name
            )
            .limit(pageSize)
            .offset(offset);

        // Apply where clause if exists
        const queryWithWhere = whereClause ? query.where(whereClause) : query;

        // Apply order by
        const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;

        // Count query with same filters
        const countQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .leftJoin(affiliations, eq(courses.affiliation_id, affiliations.id))
            .leftJoin(intakes, eq(courses.id, intakes.course_id))
            .leftJoin(enrollments, eq(intakes.id, enrollments.intake_id))
            .groupBy(
                courses.id,
                courses.title,
                courses.slug,
                courses.price,
                courses.level,
                courses.duration_type,
                courses.duration_value,
                courses.created_at,
                courses.updated_at,
                courseCategories.id,
                courseCategories.name,
                affiliations.id,
                affiliations.name
            );

        // Apply where clause to count query if exists
        const countQueryWithWhere = whereClause ? countQuery.where(whereClause) : countQuery;

        const [data, countResult] = await Promise.all([
            queryWithOrder,
            db.select({ count: sql<number>`count(*)` }).from(countQueryWithWhere.as('count_subquery'))
        ]);

        return {
            success: true,
            data: {
                data,
                total: countResult[0]?.count || 0,
                page,
                pageSize
            }
        };
    } catch (error) {
        return handleCourseError(error, 'list');
    }
}

/**
 * Single comprehensive details function with proper joins
 */
export async function adminCourseDetails(id: string): Promise<ApiResponse<CourseWithDetails>> {
    try {
        await requireAdmin();

        // Get course with category and affiliation
        const courseResult = await db
            .select()
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .leftJoin(affiliations, eq(courses.affiliation_id, affiliations.id))
            .where(eq(courses.id, id))
            .limit(1);

        if (courseResult.length === 0) {
            return {
                success: false,
                error: 'Course not found',
                code: 'NOT_FOUND'
            };
        }

        const course = courseResult[0].courses;
        const category = courseResult[0].course_categories;
        const affiliation = courseResult[0].affiliations;

        // Get associated intakes
        const intakeResult = await db
            .select()
            .from(intakes)
            .where(eq(intakes.course_id, id));

        return {
            success: true,
            data: {
                course,
                category: category || null,
                affiliation: affiliation || null,
                intakes: intakeResult
            }
        };
    } catch (error) {
        return handleCourseError(error, 'details');
    }
}

/**
 * Optimized CRUD operations with validation
 */
export async function adminCourseCreate(data: CourseCreateData): Promise<ApiResponse<CourseBase>> {
    try {
        await requireAdmin();

        // Validate data
        const validation = validateCourseData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details
            };
        }

        const values = {
            category_id: data?.category_id ?? null,
            affiliation_id: data?.affiliation_id ?? null,
            title: data.title,
            slug: data.slug,
            courseHighlights: data?.courseHighlights ?? null,
            courseOverview: data?.courseOverview ?? null,
            image_url: data?.image_url ?? null,
            level: data.level,
            duration_type: data.duration_type as TypeDurationType,
            duration_value: data.duration_value,
            price: data.price,
        };

        const [created] = await db
            .insert(courses)
            .values(values)
            .returning();

        revalidatePath('/admin/courses');
        return { success: true, data: created };
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
            return {
                success: false,
                error: 'A course with this slug already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION'
            };
        }

        return handleCourseError(error, 'create');
    }
}

export async function adminCourseUpdate(data: CourseUpdateData): Promise<ApiResponse<CourseBase>> {
    try {
        await requireAdmin();

        // Validate data
        const validation = validateCourseData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details
            };
        }

        const values = {
            category_id: data.category_id,
            affiliation_id: data.affiliation_id,
            title: data.title,
            slug: data.slug,
            course_highlights: data.courseHighlights,
            course_overview: data.courseOverview,
            image_url: data.image_url,
            level: data.level,
            duration_type: data.duration_type as TypeDurationType,
            duration_value: data.duration_value,
            price: data.price,
            updated_at: sql`now()`,
        };

        const [updated] = await db
            .update(courses)
            .set(values)
            .where(eq(courses.id, data.id))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Course not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath('/admin/courses');
        revalidatePath(`/admin/courses/${data.id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
            return {
                success: false,
                error: 'A course with this slug already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION'
            };
        }

        return handleCourseError(error, 'update');
    }
}

export async function adminCourseDelete(id: string): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        // Check constraints before deletion
        const constraints = await checkCourseConstraints(id);
        if (!constraints.canDelete) {
            return {
                success: false,
                error: `Cannot delete: referenced by ${constraints.intakeCount} intake(s) and ${constraints.enrollmentCount} enrollment(s). Update or remove those records first.`,
                code: 'CONSTRAINT_VIOLATION',
                details: {
                    intakeCount: constraints.intakeCount,
                    enrollmentCount: constraints.enrollmentCount
                }
            };
        }

        const [deleted] = await db
            .delete(courses)
            .where(eq(courses.id, id))
            .returning();

        if (!deleted) {
            return {
                success: false,
                error: 'Course not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath('/admin/courses');
        return { success: true };
    } catch (error) {
        return handleCourseError(error, 'delete');
    }
}

/**
 * Business-specific operations
 */
export async function adminCourseCheckConstraints(id: string): Promise<ApiResponse<CourseConstraintCheck>> {
    try {
        await requireAdmin();

        const result = await checkCourseConstraints(id);
        return { success: true, data: result };
    } catch (error) {
        return handleCourseError(error, 'constraint-check');
    }
}

/**
 * Image management operations
 */
export async function adminCourseImageUpload(file: File, courseId: string): Promise<ApiResponse<CourseImageUploadResult>> {
    try {
        await requireAdmin();

        // Upload image
        const imageUrl = await uploadCourseImage(file, courseId);

        // Update course with new image URL
        const [updated] = await db
            .update(courses)
            .set({
                image_url: imageUrl,
                updated_at: sql`now()`,
            })
            .where(eq(courses.id, courseId))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Course not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath(`/admin/courses/${courseId}`);
        return {
            success: true,
            data: {
                url: imageUrl,
                key: `course-${courseId}-${Date.now()}`
            }
        };
    } catch (error) {
        return handleCourseError(error, 'image-upload');
    }
}

export async function adminCourseImageDelete(imageUrl: string, courseId: string): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        // Delete image from storage
        await deleteCourseImage(imageUrl);

        // Update course to remove image URL
        const [updated] = await db
            .update(courses)
            .set({
                image_url: null,
                updated_at: sql`now()`,
            })
            .where(eq(courses.id, courseId))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Course not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath(`/admin/courses/${courseId}`);
        return { success: true };
    } catch (error) {
        return handleCourseError(error, 'image-delete');
    }
}