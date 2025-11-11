'use server';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { intakes } from '@/lib/db/schema/intakes';
import { courses } from '@/lib/db/schema/courses';
import { enrollments } from '@/lib/db/schema/enrollments';
import { logger } from '@/lib/utils/logger';
import { cache } from 'react';
import {
    IntakeListItem,
    IntakeWithDetails,
    IntakeBase,
    IntakeQueryParams,
    IntakeCreateData,
    IntakeUpdateData,
    IntakeConstraintCheck,
    IntakeStatusUpdate,
    IntakesByCourseAndYearResponse,
} from '@/lib/types/intakes';
import { ApiResponse } from '@/lib/types';
import {
    validateIntakeData,
    checkIntakeConstraints,
    IntakeValidationError,
    calculateAvailableSpots,
} from '@/lib/utils/intakes';
import {
    buildFilterConditions,
    buildWhereClause,
    buildOrderByClause,
} from '@/lib/utils/query-utils';
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
export async function handleIntakeError(
    error: unknown,
    operation: string
): Promise<ApiResponse<never>> {
    if (error instanceof IntakeValidationError) {
        const validationError = error as IntakeValidationError;
        return Promise.reject({
            success: false,
            error: validationError.message,
            code: validationError.code,
            details: validationError.details,
        });
    }

    if (error instanceof Error) {
        logger.error(`Intake ${operation} failed:`, error);
        return Promise.reject({
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR',
        });
    }

    logger.error(`Unexpected error in intake ${operation}:`, {
        error: String(error),
    });
    return Promise.reject({
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    });
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminIntakeList(params: IntakeQueryParams): Promise<
    ApiResponse<{
        data: IntakeListItem[];
        total: number;
        page: number;
        pageSize: number;
    }>
> {
    noStore();
    try {
        await requireAdmin();

        const {
            page = 1,
            pageSize = 10,
            sortBy = 'created_at',
            order = 'desc',
            filters = [],
            search,
        } = params;
        const offset = (page - 1) * pageSize;

        // Build filter conditions
        const filterConditions = buildFilterConditions(
            filters,
            intakeColumnMap
        );

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
                    price: courses.price,
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
                intakes.start_date,
                intakes.end_date,
                intakes.capacity,
                intakes.is_open,
                intakes.created_at,
                courses.title
            )
            .limit(pageSize)
            .offset(offset);

        // Apply where clause if exists
        const queryWithWhere = whereClause ? query.where(whereClause) : query;

        // Apply order by
        const queryWithOrder = orderBy
            ? queryWithWhere.orderBy(orderBy)
            : queryWithWhere;

        // Count query with same filters
        const countQuery = db
            .select({ count: sql<number>`count(DISTINCT ${intakes.id})` })
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id));

        // Apply where clause to count query if exists
        const countQueryWithWhere = whereClause
            ? countQuery.where(whereClause)
            : countQuery;

        const [data, countResult] = await Promise.all([
            queryWithOrder,
            countQueryWithWhere,
        ]);

        // Calculate available spots for each intake
        const dataWithAvailableSpots = data.map(intake => ({
            ...intake,
            available_spots: calculateAvailableSpots(
                intake.capacity,
                intake.enrollment_count
            ),
            updated_at: intake.updated_at,
        }));

        return {
            success: true,
            data: {
                data: dataWithAvailableSpots,
                total: countResult[0]?.count || 0,
                page,
                pageSize,
            },
        };
    } catch (error) {
        return handleIntakeError(error, 'list');
    }
}

/**
 * Single comprehensive details function with proper joins
 */
export async function adminIntakeDetails(
    id: string
): Promise<ApiResponse<IntakeWithDetails>> {
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
                code: 'NOT_FOUND',
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
                enrollments: enrollmentResult,
            },
        };
    } catch (error) {
        return handleIntakeError(error, 'details');
    }
}

/**
 * Optimized CRUD operations with validation
 */
export async function adminIntakeCreate(
    data: IntakeCreateData
): Promise<ApiResponse<IntakeBase>> {
    try {
        await requireAdmin();

        // Validate data
        const validation = validateIntakeData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details,
            };
        }

        const values = {
            course_id: data.course_id,
            start_date: new Date(data.start_date).toISOString(),
            end_date: new Date(data.end_date).toISOString(),
            capacity: data.capacity,
            is_open: data.is_open ?? true,
        };

        const [created] = await db.insert(intakes).values(values).returning();

        revalidatePath('/admin/intakes');
        return { success: true, data: created };
    } catch (error: any) {
        // Handle unique constraint violation
        if (
            error.code === '23505' ||
            (error.message && error.message.includes('unique'))
        ) {
            return {
                success: false,
                error: 'An intake with this name already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION',
            };
        }

        return handleIntakeError(error, 'create');
    }
}

export async function adminIntakeUpdate(
    data: IntakeUpdateData
): Promise<ApiResponse<IntakeBase>> {
    try {
        await requireAdmin();

        // Validate data
        const validation = validateIntakeData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details,
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
                code: 'NOT_FOUND',
            };
        }

        revalidatePath('/admin/intakes');
        revalidatePath(`/admin/intakes/${data.id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        // Handle unique constraint violation
        if (
            error.code === '23505' ||
            (error.message && error.message.includes('unique'))
        ) {
            return {
                success: false,
                error: 'An intake with this name already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION',
            };
        }

        return handleIntakeError(error, 'update');
    }
}

export async function adminIntakeDelete(
    id: string
): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        // Check constraints before deletion
        const constraints = await checkIntakeConstraints(id);
        if (!constraints.canDelete) {
            return {
                success: false,
                error: `Cannot delete: referenced by ${constraints.enrollmentCount} enrollment(s). Update or remove those enrollments first.`,
                code: 'CONSTRAINT_VIOLATION',
                details: { enrollmentCount: constraints.enrollmentCount },
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
                code: 'NOT_FOUND',
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
export async function adminIntakeCheckConstraints(
    id: string
): Promise<ApiResponse<IntakeConstraintCheck>> {
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
export async function adminIntakeUpdateStatus(
    data: IntakeStatusUpdate
): Promise<ApiResponse<IntakeBase>> {
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
                code: 'NOT_FOUND',
            };
        }

        revalidatePath('/admin/intakes');
        revalidatePath(`/admin/intakes/${data.id}`);
        return { success: true, data: updated };
    } catch (error) {
        return handleIntakeError(error, 'status-update');
    }
}

/**
 * Generate intakes for a specific course
 */
export async function adminIntakeGenerateForCourse(
    courseId: string
): Promise<ApiResponse<any>> {
    noStore();
    try {
        await requireAdmin();

        if (!courseId || typeof courseId !== 'string') {
            return {
                success: false,
                error: 'Course ID is required and must be a string',
            };
        }

        // Get course details to use in generating intakes
        const courseResult = await db
            .select()
            .from(courses)
            .where(eq(courses.id, courseId))
            .limit(1);

        if (courseResult.length === 0) {
            return {
                success: false,
                error: 'Course not found',
            };
        }

        const course = courseResult[0];

        // Define number of intakes to generate per year
        const months = [1, 4, 7, 10]; // Intakes in Jan, Apr, Jul, Oct
        const currentYear = new Date().getFullYear();
        const generatedIntakes = [];
        const existingCount = 0; // Placeholder - would need to check existing intakes

        for (const month of months) {
            const startDate = new Date(currentYear, month - 1, 1);
            const endDate = new Date(currentYear, month - 1, 28); // Approximate month

            // Check if an intake already exists for this month
            const existingIntake = await db
                .select()
                .from(intakes)
                .where(
                    sql`${intakes.course_id} = ${courseId} 
                         AND EXTRACT(MONTH FROM ${intakes.start_date}) = ${month}
                         AND EXTRACT(YEAR FROM ${intakes.start_date}) = ${currentYear}`
                )
                .limit(1);

            if (existingIntake.length === 0) {
                // Create new intake
                const [newIntake] = await db
                    .insert(intakes)
                    .values({
                        course_id: courseId,
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        is_open: true,
                    })
                    .returning();

                if (newIntake) {
                    generatedIntakes.push(newIntake);
                }
            }
        }

        revalidatePath('/admin/intakes');

        return {
            success: true,
            data: {
                ...generatedIntakes,
                metadata: {
                    generatedCount: generatedIntakes.length,
                    existingCount: existingCount,
                    totalCount: generatedIntakes.length + existingCount,
                },
            },
        };
    } catch (error) {
        return handleIntakeError(error, 'generate-for-course');
    }
}

/**
 * Generate intakes for a specific course with advanced configuration
 */
export async function adminIntakeGenerateForCourseAdvanced(
    courseId: string
): Promise<ApiResponse<any>> {
    noStore();
    try {
        await requireAdmin();

        if (!courseId || typeof courseId !== 'string') {
            return {
                success: false,
                error: 'Course ID is required and must be a string',
            };
        }

        // Get course details to use in generating intakes
        const courseResult = await db
            .select()
            .from(courses)
            .where(eq(courses.id, courseId))
            .limit(1);

        if (courseResult.length === 0) {
            return {
                success: false,
                error: 'Course not found',
            };
        }

        // Generate intakes based on advanced algorithm (e.g., seasonal, capacity, demand)
        const currentYear = new Date().getFullYear();
        const months = [1, 3, 5, 7, 9, 11]; // Every other month
        const generatedIntakes = [];

        for (const month of months) {
            const startDate = new Date(currentYear, month - 1, 15);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 90); // 3-month course

            // Check if an intake already exists for this period
            const existingIntake = await db
                .select()
                .from(intakes)
                .where(
                    sql`${intakes.course_id} = ${courseId} 
                         AND EXTRACT(MONTH FROM ${intakes.start_date}) = ${month}
                         AND EXTRACT(YEAR FROM ${intakes.start_date}) = ${currentYear}`
                )
                .limit(1);

            if (existingIntake.length === 0) {
                const [newIntake] = await db
                    .insert(intakes)
                    .values({
                        course_id: courseId,
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        is_open: true,
                    })
                    .returning();

                if (newIntake) {
                    generatedIntakes.push(newIntake);
                }
            }
        }

        revalidatePath('/admin/intakes');

        return {
            success: true,
            data: {
                ...generatedIntakes,
                metadata: {
                    generatedCount: generatedIntakes.length,
                    existingCount: 0, // Would need to implement check for existing
                    totalCount: generatedIntakes.length,
                },
            },
        };
    } catch (error) {
        return handleIntakeError(error, 'advanced-generate-for-course');
    }
}

/**
 * Get intakes for a specific course and year
 */
export async function adminIntakesByCourseAndYear(
    courseId: string | undefined,
    year: string = new Date().getFullYear().toString()
): Promise<ApiResponse<IntakesByCourseAndYearResponse>> {
    noStore();
    try {
        await requireAdmin();

        // Input validation
        if (courseId && typeof courseId !== 'string') {
            return {
                success: false,
                error: 'Invalid course ID provided',
            };
        }

        if (!year || typeof year !== 'string') {
            return {
                success: false,
                error: 'Invalid year provided',
            };
        }

        // Validate year format (should be 4 digits)
        const yearNumber = parseInt(year, 10);
        if (
            isNaN(yearNumber) ||
            year.length !== 4 ||
            yearNumber < 1900 ||
            yearNumber > 2100
        ) {
            return {
                success: false,
                error: 'Year must be a valid 4-digit year (e.g., 2024)',
            };
        }

        // Build the WHERE condition based on whether courseId is provided
        let whereCondition;
        if (courseId) {
            whereCondition = sql`EXTRACT(YEAR FROM ${intakes.start_date}) = ${yearNumber}
                                 AND ${intakes.course_id} = ${courseId}`;
        } else {
            whereCondition = sql`EXTRACT(YEAR FROM ${intakes.start_date}) = ${yearNumber}`;
        }

        // Get intakes for the course and year (or just for the year if no course specified)
        const intakesResult = await db
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
                    price: courses.price,
                },
                enrollment_count: sql<number>`count(enrollments.id)`,
                available_spots: sql<number>`max(${intakes.capacity}) - count(${enrollments.id})`,
            })
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .leftJoin(enrollments, eq(intakes.id, enrollments.intake_id))
            .where(whereCondition)
            .groupBy(
                intakes.id,
                courses.id,
                intakes.start_date,
                intakes.end_date,
                intakes.capacity,
                intakes.is_open,
                intakes.created_at,
                courses.title,
                courses.price,
                intakes.updated_at
            );

        // Calculate additional metadata in a single pass for better performance
        let totalRegistered = 0;
        let totalCapacity = 0;
        let openIntakes = 0;

        for (const intake of intakesResult) {
            if (intake.is_open) {
                openIntakes++;
            }
            totalRegistered += intake.enrollment_count || 0;
            totalCapacity += intake.capacity;
        }

        const totalIntakes = intakesResult.length;
        const utilizationRate =
            totalCapacity > 0
                ? Math.round((totalRegistered / totalCapacity) * 100)
                : 0;

        // Determine course title and price based on results
        const firstIntake = intakesResult[0];
        const courseTitle =
            (courseId && firstIntake?.course?.title) || 'All Courses';
        const coursePrice = (courseId && firstIntake?.course?.price) || 0;

        return {
            success: true,
            data: {
                intakes: intakesResult,
                metadata: {
                    total: totalIntakes,
                    courseId: courseId || null, // Return null if undefined
                    courseTitle,
                    year: yearNumber,
                    totalIntakes,
                    openIntakes,
                    totalRegistered,
                    utilizationRate,
                    coursePrice,
                },
            },
        };
    } catch (error) {
        return handleIntakeError(error, 'by-course-and-year');
    }
}

/**
 * List all active intakes
 */
export async function adminIntakeListAllActive(): Promise<ApiResponse<any[]>> {
    noStore();
    try {
        await requireAdmin();

        const currentYear = new Date().getFullYear();

        const result = await db
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
                    price: courses.price,
                },
                enrollment_count: sql<number>`count(enrollments.id)`,
            })
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .leftJoin(enrollments, eq(intakes.id, enrollments.intake_id))
            .where(
                sql`EXTRACT(YEAR FROM ${intakes.start_date}) = ${currentYear} 
                     AND ${intakes.is_open} = true`
            )
            .groupBy(
                intakes.id,
                courses.id,
                intakes.start_date,
                intakes.end_date,
                intakes.capacity,
                intakes.is_open,
                intakes.created_at,
                courses.title,
                courses.price,
                intakes.updated_at
            );

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return handleIntakeError(error, 'list-all-active');
    }
}

/**
 * List all intakes without pagination
 */
export async function adminIntakeListAll(): Promise<ApiResponse<any[]>> {
    noStore();
    try {
        await requireAdmin();

        const result = await db
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
                    price: courses.price,
                },
                enrollment_count: sql<number>`count(enrollments.id)`,
            })
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .leftJoin(enrollments, eq(intakes.id, enrollments.intake_id))
            .groupBy(
                intakes.id,
                courses.id,
                intakes.start_date,
                intakes.end_date,
                intakes.capacity,
                intakes.is_open,
                intakes.created_at,
                courses.title,
                courses.price,
                intakes.updated_at
            );

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return handleIntakeError(error, 'list-all');
    }
}

/**
 /**
  * Upsert intake (create if not exists, update if exists)
  */
export async function adminIntakeUpsert(
    input: any
): Promise<ApiResponse<IntakeBase>> {
    try {
        await requireAdmin();

        // If input has an ID, treat as update, otherwise as create
        if (input.id) {
            // Update existing intake
            const validation = validateIntakeData(input);
            if (!validation.success) {
                return {
                    success: false,
                    error: validation.error || 'Validation failed',
                    code: validation.code || 'VALIDATION_ERROR',
                    details: validation.details,
                };
            }

            const values = {
                course_id: input.course_id,
                start_date: new Date(input.start_date).toISOString(),
                end_date: new Date(input.end_date).toISOString(),
                capacity: input.capacity,
                is_open: input.is_open,
                updated_at: new Date().toISOString(),
            };

            const [updated] = await db
                .update(intakes)
                .set(values)
                .where(eq(intakes.id, input.id))
                .returning();

            if (!updated) {
                return {
                    success: false,
                    error: 'Intake not found',
                    code: 'NOT_FOUND',
                };
            }

            revalidatePath('/admin/intakes');
            revalidatePath(`/admin/intakes/${input.id}`);
            return { success: true, data: updated };
        } else {
            // Create new intake
            const validation = validateIntakeData(input);
            if (!validation.success) {
                return {
                    success: false,
                    error: validation.error || 'Validation failed',
                    code: validation.code || 'VALIDATION_ERROR',
                    details: validation.details,
                };
            }

            const values = {
                course_id: input.course_id,
                start_date: new Date(input.start_date).toISOString(),
                end_date: new Date(input.end_date).toISOString(),
                capacity: input.capacity,
                is_open: input.is_open ?? true,
            };

            const [created] = await db
                .insert(intakes)
                .values(values)
                .returning();

            revalidatePath('/admin/intakes');
            return { success: true, data: created };
        }
    } catch (error: any) {
        // Handle unique constraint violation
        if (
            error.code === '23505' ||
            (error.message && error.message.includes('unique'))
        ) {
            return {
                success: false,
                error: 'An intake with this name already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION',
            };
        }

        return handleIntakeError(error, 'upsert');
    }
}

export const cachedAdminIntakeList = cache(adminIntakeList);
export const cachedAdminIntakeListAll = cache(adminIntakeListAll);
export const cachedAdminIntakeListAllActive = cache(adminIntakeListAllActive);
