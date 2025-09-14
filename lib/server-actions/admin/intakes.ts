'use server';

import type { ColumnFilter } from '@tanstack/react-table';
import {
    and,
    type AnyColumn,
    asc,
    desc,
    eq,
    gte,
    inArray,
    type SQL,
    sql,
} from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { db } from '@/lib/db/drizzle';
import { courses as coursesTable } from '@/lib/db/schema/courses';
import { intakes as intakesTable } from '@/lib/db/schema/intakes';
import { requireAdmin } from '@/utils/auth-guard';
import type { ZodInsertIntakeType } from '@/lib/db/drizzle-zod-schema/intakes';
import { isValidTableColumnName } from '@/utils/utils';
import { DurationType } from '../../db/schema/enums';

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
    data?: (typeof intakesTable.$inferSelect)[];
    error?: string;
    message?: string;
    generatedCount?: number;
    existingCount?: number;
    totalCount?: number;
};

export type ListParams = Partial<DataTableListParams>;

/**
 * Get paginated list of intakes with optional search by course title
 */
export async function adminIntakeList({
    page = 1,
    pageSize = 10,
    sortBy = 'created_at',
    order = 'desc',
    filters = [],
}: ListParams) {
    try {
        const offset = (page - 1) * pageSize;

        const selectColumns = {
            id: intakesTable.id,
            course_id: intakesTable.course_id,
            total_registered: intakesTable.total_registered,
            courseTitle: coursesTable.title,
            coursePrice: coursesTable.price, // Added coursePrice
            start_date: intakesTable.start_date,
            end_date: intakesTable.end_date,
            capacity: intakesTable.capacity,
            is_open: intakesTable.is_open,
            created_at: intakesTable.created_at,
        };

        const columnMap: Record<string, AnyColumn> = {
            id: intakesTable.id,
            course_id: intakesTable.course_id,
            courseTitle: coursesTable.title,
            coursePrice: coursesTable.price, // Added coursePrice
            start_date: intakesTable.start_date,
            end_date: intakesTable.end_date,
            capacity: intakesTable.capacity,
            is_open: intakesTable.is_open,
            created_at: intakesTable.created_at,
        };

        const filterConditions = filters
            ?.map((filter: ColumnFilter) => {
                const col = columnMap[filter.id];
                if (col && typeof filter.value === 'string') {
                    return sql`to_tsvector('english', ${col}) @@ to_tsquery('english', ${filter.value} || ':*')`;
                }
                if (
                    col &&
                    Array.isArray(filter.value) &&
                    filter.value.length > 0 &&
                    ['status', 'method', 'duration_type'].includes(filter.id)
                ) {
                    // For array filters, create a combined tsquery
                    return inArray(col, filter.value);
                }
                return null;
            })
            .filter(Boolean);
        const whereClause =
            filterConditions?.length > 0
                ? sql.join(filterConditions as SQL<unknown>[], sql` AND `)
                : undefined;

        const sortColumn: AnyColumn = isValidTableColumnName(sortBy, intakesTable)
            ? (intakesTable[sortBy] as AnyColumn)
            : intakesTable.created_at;

        const sort = order === 'asc' ? asc(sortColumn) : desc(sortColumn);
        const baseQuery = db
            .select(selectColumns)
            .from(intakesTable)
            .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
            .where(whereClause)
            .orderBy(sort)
            .limit(pageSize)
            .offset(offset);

        const [data, [{ count }]] = await Promise.all([
            baseQuery,
            db
                .select({ count: sql<number>`count(*)` })
                .from(intakesTable)
                .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
                .where(whereClause),
        ]);

        return {
            success: true,
            data: data as IntakeWithCourse[],
            total: count ?? 0,
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

/**
 * Get intakes for a specific course and year
 *
 * @param courseId - The UUID of the course
 * @param year - The year as a string (e.g., "2024")
 * @returns Promise with success status and intake data
 */
export async function adminIntakesByCourseAndYear(courseId: string, year: string | undefined = new Date().getFullYear().toString()) {
    try {
        // Input validation
        if (!courseId || typeof courseId !== 'string') {
            return { success: false, error: 'Invalid course ID provided' };
        }

        if (!year || typeof year !== 'string') {
            return { success: false, error: 'Invalid year provided' };
        }

        // Validate year format (should be 4 digits)
        const yearNumber = parseInt(year, 10);
        if (isNaN(yearNumber) || year.length !== 4 || yearNumber < 1900 || yearNumber > 2100) {
            return { success: false, error: 'Year must be a valid 4-digit year (e.g., 2024)' };
        }

        // Check if course exists
        const [course] = await db
            .select({
                id: coursesTable.id,
                title: coursesTable.title,
            })
            .from(coursesTable)
            .where(eq(coursesTable.id, courseId))
            .limit(1);

        if (!course) {
            return { success: false, error: 'Course not found' };
        }

        // Fetch intakes for the specified course and year
        const intakes = await db
            .select({
                id: intakesTable.id,
                course_id: intakesTable.course_id,
                courseTitle: coursesTable.title,
                coursePrice: coursesTable.price,
                start_date: intakesTable.start_date,
                end_date: intakesTable.end_date,
                capacity: intakesTable.capacity,
                total_registered: intakesTable.total_registered,
                is_open: intakesTable.is_open,
                created_at: intakesTable.created_at,
            })
            .from(intakesTable)
            .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
            .where(
                and(
                    eq(intakesTable.course_id, courseId),
                    eq(
                        sql`EXTRACT(YEAR FROM ${intakesTable.start_date})::int`,
                        yearNumber
                    )
                )
            )
            .orderBy(asc(intakesTable.start_date));

        // Calculate statistics
        const openIntakes = intakes.filter(intake => intake.is_open);
        const totalCapacity = intakes.reduce((sum, intake) => sum + intake.capacity, 0);
        const totalRegistered = intakes.reduce((sum, intake) => sum + intake.total_registered, 0);
        const availableSpots = totalCapacity - totalRegistered;

        return {
            success: true,
            data: intakes as IntakeWithCourse[],
            metadata: {
                courseId,
                courseTitle: course.title,
                year: yearNumber,
                totalIntakes: intakes.length,
                openIntakes: openIntakes.length,
                closedIntakes: intakes.length - openIntakes.length,
                totalCapacity,
                totalRegistered,
                availableSpots,
                utilizationRate: totalCapacity > 0 ? Math.round((totalRegistered / totalCapacity) * 100) : 0
            }
        };
    } catch (error) {
        const e = error as Error;
        console.error('Error fetching intakes by course and year:', {
            courseId,
            year,
            error: e.message,
            timestamp: new Date().toISOString()
        });
        return { success: false, error: e.message };
    }
}

export async function adminIntakeListAllActive() {
    try {
        const currentYear = new Date().getFullYear();

        const data = await db
            .select({
                id: intakesTable.id,
                course_id: intakesTable.course_id,
                courseTitle: coursesTable.title,
                coursePrice: coursesTable.price,
                start_date: intakesTable.start_date,
                end_date: intakesTable.end_date,
                capacity: intakesTable.capacity,
                is_open: intakesTable.is_open,
                created_at: intakesTable.created_at,
            })
            .from(intakesTable)
            .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
            .where(
                gte(
                    sql`EXTRACT(YEAR FROM ${intakesTable.start_date})::int`,
                    currentYear
                )
            )
            .orderBy(desc(intakesTable.created_at));

        return {
            success: true,
            data: data as IntakeWithCourse[],
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}
/**
 * Get all intakes
 */
export async function adminIntakeListAll() {
    try {
        const data = await db
            .select({
                id: intakesTable.id,
                course_id: intakesTable.course_id,
                courseTitle: coursesTable.title,
                coursePrice: coursesTable.price,
                start_date: intakesTable.start_date,
                end_date: intakesTable.end_date,
                capacity: intakesTable.capacity,
                is_open: intakesTable.is_open,
                created_at: intakesTable.created_at,
            })
            .from(intakesTable)
            .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
            .orderBy(desc(intakesTable.created_at));

        return {
            success: true,
            data: data as IntakeWithCourse[],
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}
/**
 * Get single intake by ID with course info
 */
export async function adminIntakeDetailsById(id: string) {
    try {
        const [data] = await db
            .select()
            .from(intakesTable)
            .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
            .where(eq(intakesTable.id, id))
            .limit(1);

        return {
            success: true,
            data: {
                ...data?.intakes,
                course: data?.courses ? { ...data.courses } : undefined,
            },
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

/**
 * Create or update an intake
 */
export async function adminIntakeUpsert(
    input: ZodInsertIntakeType
) {
    try {
        await requireAdmin();

        let data: (typeof intakesTable.$inferSelect)[];
        if (input.id) {
            data = await db
                .update(intakesTable)
                .set(input)
                .where(eq(intakesTable.id, input.id))
                .returning();
        } else {
            data = await db.insert(intakesTable).values(input).returning();
        }

        revalidatePath('/admin/intakes');
        return { success: true, data: data[0] };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

/**
 * Delete an intake by ID
 */
export async function adminIntakeDeleteById(id: string) {
    try {
        await requireAdmin();

        const data = await db
            .delete(intakesTable)
            .where(eq(intakesTable.id, id))
            .returning();
        revalidatePath('/admin/intakes');
        return { success: true, data: data[0] };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export async function adminIntakeGenerateForCourse(courseId: string) {
    try {
        await requireAdmin();

        const [course] = await db
            .select()
            .from(coursesTable)
            .where(eq(coursesTable.id, courseId));

        if (!course) {
            return { success: false, error: 'Course not found' };
        }

        const today = new Date();
        const currentYear = today.getFullYear();

        const intakes: (typeof intakesTable.$inferInsert)[] = [];
        for (let i = 0; i < 3; i++) {
            const startDate = new Date(currentYear, i * 4, 1);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + course.duration_value);

            intakes.push({
                id: crypto.randomUUID(),
                course_id: courseId,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                capacity: 20,
                is_open: true,
            });
        }

        const data = await db.insert(intakesTable).values(intakes).returning();
        revalidatePath(`/admin/courses/${courseId}`);
        return { success: true, data };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

/**
 * Validates intake date ranges for logical consistency
 */
function validateIntakeDates(startDate: Date, endDate: Date): { isValid: boolean; error?: string } {
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    if (startDate >= endDate) {
        return { isValid: false, error: 'Start date must be before end date' };
    }

    if (endDate.getTime() - startDate.getTime() < 24 * 60 * 60 * 1000) {
        return { isValid: false, error: 'Intake duration must be at least 1 day' };
    }

    if (startDate > oneYearFromNow) {
        return { isValid: false, error: 'Start date cannot be more than 1 year in the future' };
    }

    return { isValid: true };
}

/**
 * Enhanced function to check current year intakes with detailed information
 */
export async function checkCurrentYearIntakes(courseId: string) {
    try {
        // Input validation
        if (!courseId || typeof courseId !== 'string') {
            return { success: false, error: 'Invalid course ID provided' };
        }

        const [course] = await db
            .select({
                id: coursesTable.id,
                title: coursesTable.title,
            })
            .from(coursesTable)
            .where(eq(coursesTable.id, courseId))
            .limit(1);

        if (!course) {
            return { success: false, error: 'Course not found' };
        }

        const currentYear = new Date().getFullYear();
        const existingIntakes = await db
            .select({
                id: intakesTable.id,
                start_date: intakesTable.start_date,
                end_date: intakesTable.end_date,
                capacity: intakesTable.capacity,
                total_registered: intakesTable.total_registered,
                is_open: intakesTable.is_open,
            })
            .from(intakesTable)
            .where(
                and(
                    eq(intakesTable.course_id, courseId),
                    gte(
                        sql`EXTRACT(YEAR FROM ${intakesTable.start_date})::int`,
                        currentYear
                    )
                )
            )
            .orderBy(asc(intakesTable.start_date));

        // Calculate additional statistics
        const openIntakes = existingIntakes.filter(intake => intake.is_open);
        const totalCapacity = existingIntakes.reduce((sum, intake) => sum + intake.capacity, 0);
        const totalRegistered = existingIntakes.reduce((sum, intake) => sum + intake.total_registered, 0);

        return {
            success: true,
            hasIntakes: existingIntakes.length > 0,
            count: existingIntakes.length,
            openCount: openIntakes.length,
            totalCapacity,
            totalRegistered,
            availableSpots: totalCapacity - totalRegistered,
            intakes: existingIntakes,
            courseTitle: course.title
        };
    } catch (error) {
        const e = error as Error;
        console.error('Error checking current year intakes:', {
            courseId,
            error: e.message,
            timestamp: new Date().toISOString()
        });
        return { success: false, error: e.message };
    }
}

// Configuration constants for intake generation
const INTAKE_CONFIG = {
    DEFAULT_CAPACITY: 20,
    MIN_INTAKE_INTERVAL_DAYS: 30, // Minimum days between intake start dates
    MAX_INTAKES_PER_YEAR: 12,
    DAYS_PER_MONTH: 30.44, // More accurate average
    WEEKS_PER_MONTH: 4.33, // More accurate average
} as const;

/**
 * Converts course duration to days for consistent calculations
 */
function convertDurationToDays(durationType: string, durationValue: number): number {
    switch (durationType) {
        case DurationType.days:
            return durationValue;
        case DurationType.week:
            return durationValue * 7;
        case DurationType.month:
            return Math.round(durationValue * INTAKE_CONFIG.DAYS_PER_MONTH);
        case DurationType.year:
            return durationValue * 365;
        default:
            throw new Error(`Unsupported duration type: ${durationType}`);
    }
}

/**
 * Calculates optimal number of intakes per year based on course duration
 */
function calculateOptimalIntakesPerYear(courseDurationDays: number): number {
    // For very short courses (< 30 days), allow monthly intakes
    if (courseDurationDays < 30) {
        return INTAKE_CONFIG.MAX_INTAKES_PER_YEAR;
    }

    // For longer courses, ensure reasonable spacing between intakes
    const minIntervalDays = Math.max(
        INTAKE_CONFIG.MIN_INTAKE_INTERVAL_DAYS,
        Math.floor(courseDurationDays * 0.5) // Allow 50% overlap at most
    );

    const maxIntakes = Math.floor(365 / minIntervalDays);
    return Math.min(maxIntakes, INTAKE_CONFIG.MAX_INTAKES_PER_YEAR);
}

/**
 * Generates optimal start dates for intakes throughout the year
 */
function generateIntakeStartDates(
    numIntakes: number,
    currentYear: number,
    today: Date
): Date[] {
    const startDates: Date[] = [];
    const monthsPerIntake = 12 / numIntakes;

    for (let i = 0; i < numIntakes; i++) {
        const monthIndex = Math.floor(i * monthsPerIntake);
        // Start on the first day of the month for consistency
        const startDate = new Date(currentYear, monthIndex, 1);

        // Only include future dates or dates within the current month
        if (startDate >= today ||
            (startDate.getMonth() === today.getMonth() && startDate.getFullYear() === today.getFullYear())) {
            startDates.push(startDate);
        }
    }

    return startDates;
}

/**
 * Checks if a proposed intake conflicts with existing intakes
 */
function hasIntakeConflict(
    proposedStart: Date,
    proposedEnd: Date,
    existingIntakes: Array<{ start_date: string; end_date: string }>
): boolean {
    return existingIntakes.some(existing => {
        const existingStart = new Date(existing.start_date);
        const existingEnd = new Date(existing.end_date);

        // Check for any overlap between date ranges
        return (proposedStart <= existingEnd && proposedEnd >= existingStart);
    });
}

/**
 * Advanced intake generation with improved logic, validation, and atomicity
 *
 * @param courseId - The UUID of the course to generate intakes for
 * @returns Promise<IntakeGenerationResult> - Result object with success status, data, and metadata
 */
export async function adminIntakeGenerateForCourseAdvanced(
    courseId: string
): Promise<IntakeGenerationResult> {
    // Input validation
    if (!courseId || typeof courseId !== 'string') {
        return {
            success: false,
            error: 'Invalid course ID provided'
        };
    }

    try {
        // Verify admin permissions
        await requireAdmin();

        // Fetch course details with specific fields needed
        const [course] = await db
            .select({
                id: coursesTable.id,
                title: coursesTable.title,
                duration_value: coursesTable.duration_value,
                duration_type: coursesTable.duration_type,
            })
            .from(coursesTable)
            .where(eq(coursesTable.id, courseId))
            .limit(1);

        if (!course) {
            return {
                success: false,
                error: 'Course not found. Please verify the course ID.'
            };
        }

        // Validate course duration
        if (!course.duration_value || course.duration_value <= 0) {
            return {
                success: false,
                error: 'Invalid course duration. Course must have a positive duration value.'
            };
        }

        const today = new Date();
        const currentYear = today.getFullYear();

        // Convert course duration to days for consistent calculations
        const courseDurationDays = convertDurationToDays(
            course.duration_type,
            course.duration_value
        );

        // Calculate optimal number of intakes for the year
        const optimalIntakesPerYear = calculateOptimalIntakesPerYear(courseDurationDays);

        // Generate proposed start dates
        const proposedStartDates = generateIntakeStartDates(
            optimalIntakesPerYear,
            currentYear,
            today
        );

        if (proposedStartDates.length === 0) {
            return {
                success: false,
                error: 'No suitable intake dates available for the current year.'
            };
        }

        // Fetch existing intakes for this course in the current year
        const existingIntakes = await db
            .select({
                id: intakesTable.id,
                start_date: intakesTable.start_date,
                end_date: intakesTable.end_date,
            })
            .from(intakesTable)
            .where(
                and(
                    eq(intakesTable.course_id, courseId),
                    gte(
                        sql`EXTRACT(YEAR FROM ${intakesTable.start_date})::int`,
                        currentYear
                    )
                )
            );

        // Generate new intakes, avoiding conflicts
        const newIntakes: (typeof intakesTable.$inferInsert)[] = [];

        for (const startDate of proposedStartDates) {
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + courseDurationDays);

            // Validate the proposed dates
            const dateValidation = validateIntakeDates(startDate, endDate);
            if (!dateValidation.isValid) {
                console.warn(`Skipping invalid intake dates: ${dateValidation.error}`, {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    courseId
                });
                continue;
            }

            // Check for conflicts with existing intakes
            if (!hasIntakeConflict(startDate, endDate, existingIntakes)) {
                newIntakes.push({
                    course_id: courseId,
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    capacity: INTAKE_CONFIG.DEFAULT_CAPACITY,
                    is_open: true,
                });
            }
        }

        // Handle case where no new intakes can be created
        if (newIntakes.length === 0) {
            return {
                success: true,
                data: [],
                message: 'No new intakes needed. All optimal intake slots are already filled.',
                existingCount: existingIntakes.length
            };
        }

        // Use database transaction for atomicity
        const insertedIntakes = await db.transaction(async (tx) => {
            return await tx
                .insert(intakesTable)
                .values(newIntakes)
                .returning();
        });

        // Revalidate the course page to reflect changes
        revalidatePath(`/admin/courses/${courseId}`);
        revalidatePath('/admin/intakes');

        return {
            success: true,
            data: insertedIntakes,
            message: `Successfully generated ${insertedIntakes.length} new intake(s) for ${course.title}`,
            generatedCount: insertedIntakes.length,
            existingCount: existingIntakes.length,
            totalCount: existingIntakes.length + insertedIntakes.length
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        // Log error for debugging (in production, use proper logging service)
        console.error('Error generating intakes for course:', {
            courseId,
            error: errorMessage,
            timestamp: new Date().toISOString()
        });

        return {
            success: false,
            error: `Failed to generate intakes: ${errorMessage}`
        };
    }
}

export const cachedAdminIntakeList = cache(adminIntakeList);
export const cachedAdminIntakeListAll = cache(adminIntakeListAll);
export const cachedAdminIntakeDetailsById = cache(adminIntakeDetailsById);
export const cachedAdminIntakeListAllActive = cache(adminIntakeListAllActive);
