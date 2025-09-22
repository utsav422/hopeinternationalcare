'use server';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { intakes, } from '@/lib/db/schema/intakes';
import { courses } from '@/lib/db/schema/courses';
import { enrollments } from '@/lib/db/schema/enrollments';
import { logger } from '@/lib/utils/logger';
import {
    IntakeListItem,
    IntakeWithDetails, IntakeBase,
    IntakeQueryParams,
    IntakeCreateData,
    IntakeUpdateData,
    IntakeConstraintCheck,
    IntakeStatusUpdate
} from '@/lib/types/intakes';
import { ApiResponse } from '@/lib/types';
import {
    validateIntakeData,
    checkIntakeConstraints,
    IntakeValidationError,
    calculateAvailableSpots
} from '@/lib/utils/intakes';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import { requireAdmin } from '@/utils/auth-guard';

// Column mappings for intakes
const intakeColumnMap = {
    id: intakes.id,
    course_title: courses.title,
    course_id: courses.id,
    start_date: intakes.start_date,
    end_date: intakes.end_date,
    application_deadline: intakes.end_date,
    capacity: intakes.capacity,
    is_open: intakes.is_open,
    created_at: intakes.created_at,
};

/**
 * Error handling utility
 */
export function handleIntakeError(error: unknown, operation: string): ApiResponse<never> {
    if (error instanceof IntakeValidationError) {
        const validationError = error as IntakeValidationError;
        return {
            success: false,
            error: validationError.message,
            code: validationError.code,
            details: validationError.details
        };
    }

    if (error instanceof Error) {
        logger.error(`Intake ${operation} failed:`, error);
        return {
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR'
        };
    }

    logger.error(`Unexpected error in intake ${operation}:`, { error: String(error) });
    return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
    };
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminIntakeList(params: IntakeQueryParams): Promise<ApiResponse<{
    data: IntakeListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    noStore();
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
        const filterConditions = buildFilterConditions(filters, intakeColumnMap);

        // Add search condition if provided
        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(
                sql`(${courses.title} ILIKE ${searchFilter} OR ${courses.title} ILIKE ${searchFilter})`
            );
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, intakeColumnMap);

        // Main query with filters, pagination, and joins
        const query = db
            .select({
                id: intakes.id,
                start_date: intakes.start_date,
                end_date: intakes.end_date,
                capacity: intakes.capacity,
                is_open: intakes.is_open,
                created_at: intakes.created_at,
                updated_at: intakes.updated_at,
                course: {
                    id: courses.id,
                    title: courses.title,
                },
                enrollment_count: sql<number>`count(enrollments.id)`,
            })
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .leftJoin(enrollments, eq(intakes.id, enrollments.intake_id))
            .groupBy(
                intakes.id,
                courses.id,
                // Re-group all selected non-aggregated columns
                intakes.start_date, intakes.end_date, intakes.capacity, intakes.is_open, intakes.created_at, courses.title
            )
            .limit(pageSize)
            .offset(offset);

        // Apply where clause if exists
        const queryWithWhere = whereClause ? query.where(whereClause) : query;

        // Apply order by
        const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;

        // Count query with same filters
        const countQuery = db
            .select({ count: sql<number>`count(DISTINCT ${intakes.id})` })
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id));

        // Apply where clause to count query if exists
        const countQueryWithWhere = whereClause ? countQuery.where(whereClause) : countQuery;

        const [data, countResult] = await Promise.all([
            queryWithOrder,
            countQueryWithWhere,
        ]);

        // Calculate available spots for each intake
        const dataWithAvailableSpots = data.map(intake => ({
            ...intake,
            available_spots: calculateAvailableSpots(intake.capacity, intake.enrollment_count),
            updated_at: intake.updated_at,
        }));

        return {
            success: true,
            data: {
                data: dataWithAvailableSpots,
                total: countResult[0]?.count || 0,
                page,
                pageSize
            }
        };
    } catch (error) {
        return handleIntakeError(error, 'list');
    }
}

/**
 * Single comprehensive details function with proper joins
 */
export async function adminIntakeDetails(id: string): Promise<ApiResponse<IntakeWithDetails>> {
    noStore();
    try {
        await requireAdmin();

        // Get intake with course
        const intakeResult = await db
            .select()
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .where(eq(intakes.id, id))
            .limit(1);

        if (intakeResult.length === 0) {
            return {
                success: false,
                error: 'Intake not found',
                code: 'NOT_FOUND'
            };
        }

        const intake = intakeResult[0].intakes;
        const course = intakeResult[0].courses;

        // Get associated enrollments
        const enrollmentResult = await db
            .select()
            .from(enrollments)
            .where(eq(enrollments.intake_id, id));

        return {
            success: true,
            data: {
                intake,
                course: course || null,
                enrollments: enrollmentResult
            }
        };
    } catch (error) {
        return handleIntakeError(error, 'details');
    }
}

/**
 * Optimized CRUD operations with validation
 */
export async function adminIntakeCreate(data: IntakeCreateData): Promise<ApiResponse<IntakeBase>> {
    try {
        await requireAdmin();

        // Validate data
        const validation = validateIntakeData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details
            };
        }

        const values = {
            course_id: data.course_id,
            start_date: new Date(data.start_date).toISOString(),
            end_date: new Date(data.end_date).toISOString(),
            capacity: data.capacity,
            is_open: data.is_open ?? true,
        };

        const [created] = await db
            .insert(intakes)
            .values(values)
            .returning();

        revalidatePath('/admin/intakes');
        return { success: true, data: created };
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
            return {
                success: false,
                error: 'An intake with this name already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION'
            };
        }

        return handleIntakeError(error, 'create');
    }
}

export async function adminIntakeUpdate(data: IntakeUpdateData): Promise<ApiResponse<IntakeBase>> {
    try {
        await requireAdmin();

        // Validate data
        const validation = validateIntakeData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details
            };
        }

        const values = {
            course_id: data.course_id,
            start_date: new Date(data.start_date).toISOString(),
            end_date: new Date(data.end_date).toISOString(),
            capacity: data.capacity,
            is_open: data.is_open,
            updated_at: new Date().toISOString(),
        };

        const [updated] = await db
            .update(intakes)
            .set(values)
            .where(eq(intakes.id, data.id))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Intake not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath('/admin/intakes');
        revalidatePath(`/admin/intakes/${data.id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
            return {
                success: false,
                error: 'An intake with this name already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION'
            };
        }

        return handleIntakeError(error, 'update');
    }
}

export async function adminIntakeDelete(id: string): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        // Check constraints before deletion
        const constraints = await checkIntakeConstraints(id);
        if (!constraints.canDelete) {
            return {
                success: false,
                error: `Cannot delete: referenced by ${constraints.enrollmentCount} enrollment(s). Update or remove those enrollments first.`,
                code: 'CONSTRAINT_VIOLATION',
                details: { enrollmentCount: constraints.enrollmentCount }
            };
        }

        const [deleted] = await db
            .delete(intakes)
            .where(eq(intakes.id, id))
            .returning();

        if (!deleted) {
            return {
                success: false,
                error: 'Intake not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath('/admin/intakes');
        return { success: true };
    } catch (error) {
        return handleIntakeError(error, 'delete');
    }
}

/**
 * Business-specific operations
 */
export async function adminIntakeCheckConstraints(id: string): Promise<ApiResponse<IntakeConstraintCheck>> {
    try {
        await requireAdmin();

        const result = await checkIntakeConstraints(id);
        return { success: true, data: result };
    } catch (error) {
        return handleIntakeError(error, 'constraint-check');
    }
}

/**
 * Status update operation
 */
export async function adminIntakeUpdateStatus(data: IntakeStatusUpdate): Promise<ApiResponse<IntakeBase>> {
    try {
        await requireAdmin();

        const values = {
            is_open: data.is_open,
            updated_at: sql`now()`,
        };

        const [updated] = await db
            .update(intakes)
            .set(values)
            .where(eq(intakes.id, data.id))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Intake not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath('/admin/intakes');
        revalidatePath(`/admin/intakes/${data.id}`);
        return { success: true, data: updated };
    } catch (error) {
        return handleIntakeError(error, 'status-update');
    }
}