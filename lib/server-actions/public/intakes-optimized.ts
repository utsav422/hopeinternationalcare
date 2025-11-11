'use server';

import { and, eq, gte, lte, asc } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import { courses, intakes } from '@/lib/db/schema';
import {
    PublicIntakeDetail,
    ActiveIntake,
    UpcomingIntake,
    CourseIntakeBySlug,
} from '@/lib/types/public/intakes';
import { logger } from '@/lib/utils/logger';
import { ApiResponse } from '@/lib/types';

/**
 * Get active intakes by course ID
 */
export async function getActiveIntakesByCourseId(
    courseId: string
): Promise<ApiResponse<ActiveIntake[]>> {
    try {
        if (!courseId) {
            return {
                success: false,
                error: 'Course ID is required',
                code: 'MISSING_COURSE_ID',
            };
        }

        const today = new Date().toISOString();
        const courseIntakes = await db
            .select({
                id: intakes.id,
                start_date: intakes.start_date,
                end_date: intakes.end_date,
                is_open: intakes.is_open,
                capacity: intakes.capacity,
                total_registered: intakes.total_registered,
                course_id: intakes.course_id,
                created_at: intakes.created_at,
            })
            .from(intakes)
            .where(
                and(
                    eq(intakes.course_id, courseId),
                    gte(intakes.start_date, today), // Only upcoming intakes (original logic)
                    eq(intakes.is_open, true) // Only open intakes
                )
            )
            .orderBy(asc(intakes.start_date));

        // Type assertion to handle nullable fields
        const typedCourseIntakes: ActiveIntake[] = courseIntakes.map(
            intake => ({
                id: intake.id,
                start_date: intake.start_date,
                end_date: intake.end_date,
                is_open: intake.is_open ?? true,
                capacity: intake.capacity,
                total_registered: intake.total_registered,
                course_id: intake.course_id ?? '',
                created_at: intake.created_at,
            })
        );

        return { success: true, data: typedCourseIntakes };
    } catch (error: unknown) {
        logger.error(
            'Error fetching active intakes by course ID:',
            error instanceof Error
                ? { message: error.message }
                : { message: String(error) }
        );
        return {
            success: false,
            error: 'Failed to fetch course intakes',
            code: 'FETCH_ERROR',
        };
    }
}

/**
 * Get intake by ID
 */
export async function getIntakeById(
    intakeId: string
): Promise<ApiResponse<PublicIntakeDetail>> {
    try {
        if (!intakeId) {
            return {
                success: false,
                error: 'Intake ID is required',
                code: 'MISSING_INTAKE_ID',
            };
        }

        const [data] = await db
            .select({
                id: intakes.id,
                start_date: intakes.start_date,
                end_date: intakes.end_date,
                is_open: intakes.is_open,
                capacity: intakes.capacity,
                total_registered: intakes.total_registered,
                course_id: intakes.course_id,
                created_at: intakes.created_at,
            })
            .from(intakes)
            .where(eq(intakes.id, intakeId))
            .limit(1);

        if (!data) {
            return {
                success: false,
                error: 'Intake not found',
                code: 'NOT_FOUND',
            };
        }

        // Type assertion to match the expected interface
        const typedData: PublicIntakeDetail = {
            id: data.id,
            start_date: data.start_date,
            end_date: data.end_date,
            is_open: data.is_open ?? true, // Provide default value
            capacity: data.capacity,
            total_registered: data.total_registered,
            course_id: data.course_id ?? '', // Provide default value
            created_at: data.created_at,
        };

        return { success: true, data: typedData };
    } catch (error: unknown) {
        logger.error(
            'Error fetching intake by ID:',
            error instanceof Error
                ? { message: error.message }
                : { message: String(error) }
        );
        return {
            success: false,
            error: 'Failed to fetch course intakes',
            code: 'FETCH_ERROR',
        };
    }
}

/**
 * Get upcoming intakes
 */
export async function getUpcomingIntakes(): Promise<
    ApiResponse<UpcomingIntake[]>
> {
    try {
        const today = new Date().toISOString();
        const upcomingIntakes = await db
            .select({
                intakeId: intakes.id,
                courseTitle: courses.title,
                startDate: intakes.start_date,
                capacity: intakes.capacity,
                totalRegistered: intakes.total_registered,
            })
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .where(
                and(gte(intakes.start_date, today), eq(intakes.is_open, true))
            )
            .orderBy(intakes.start_date)
            .limit(5);

        logger.debug('Upcoming Intakes:', { count: upcomingIntakes.length });

        // Type assertion to handle nullable fields
        const typedUpcomingIntakes: UpcomingIntake[] = upcomingIntakes.map(
            intake => ({
                intakeId: intake.intakeId,
                courseTitle: intake.courseTitle ?? '',
                startDate: intake.startDate,
                capacity: intake.capacity,
                totalRegistered: intake.totalRegistered,
            })
        );

        return { success: true, data: typedUpcomingIntakes };
    } catch (error: unknown) {
        logger.error(
            'Error fetching upcoming intakes:',
            error instanceof Error
                ? { message: error.message }
                : { message: String(error) }
        );
        return {
            success: false,
            error: 'Failed to fetch upcoming intakes',
            code: 'FETCH_ERROR',
        };
    }
}

/**
 * Get all intakes
 */
export async function getAllIntakes(): Promise<ApiResponse<ActiveIntake[]>> {
    try {
        const today = new Date().toISOString();
        const allIntakes = await db.query.intakes.findMany({
            where: and(
                gte(intakes.start_date, today), // Only active and upcoming intakes
                eq(intakes.is_open, true) // Only open intakes
            ),
            orderBy: (intakes, { asc }) => [asc(intakes.start_date)],
        });

        // Type assertion to handle nullable fields
        const typedAllIntakes: ActiveIntake[] = allIntakes.map(intake => ({
            id: intake.id,
            start_date: intake.start_date,
            end_date: intake.end_date,
            is_open: intake.is_open ?? true,
            capacity: intake.capacity,
            total_registered: intake.total_registered,
            course_id: intake.course_id ?? '',
            created_at: intake.created_at,
        }));

        return { success: true, data: typedAllIntakes };
    } catch (error: unknown) {
        logger.error(
            'Error fetching all intakes:',
            error instanceof Error
                ? { message: error.message }
                : { message: String(error) }
        );
        return {
            success: false,
            error: 'Failed to fetch all intakes',
            code: 'FETCH_ERROR',
        };
    }
}

/**
 * Get course intakes by slug
 */
export async function getCourseIntakesBySlug(
    slug: string
): Promise<ApiResponse<CourseIntakeBySlug[]>> {
    try {
        if (!slug) {
            return {
                success: false,
                error: 'Slug is required',
                code: 'MISSING_SLUG',
            };
        }

        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1).toISOString();
        const endDate = new Date(
            currentYear,
            11,
            31,
            23,
            59,
            59,
            999
        ).toISOString();

        const courseIntakes = await db
            .select({
                id: intakes.id,
                start_date: intakes.start_date,
                end_date: intakes.end_date,
                is_open: intakes.is_open,
                capacity: intakes.capacity,
                total_registered: intakes.total_registered,
                course_id: intakes.course_id,
                created_at: intakes.created_at,
            })
            .from(intakes)
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .where(
                and(
                    eq(courses.slug, slug),
                    gte(intakes.start_date, startDate),
                    lte(intakes.start_date, endDate)
                )
            );

        // Type assertion to handle nullable fields
        const typedCourseIntakes: CourseIntakeBySlug[] = courseIntakes.map(
            intake => ({
                id: intake.id,
                start_date: intake.start_date,
                end_date: intake.end_date,
                is_open: intake.is_open ?? true,
                capacity: intake.capacity,
                total_registered: intake.total_registered,
                course_id: intake.course_id ?? '',
                created_at: intake.created_at,
            })
        );

        return { success: true, data: typedCourseIntakes };
    } catch (error: unknown) {
        logger.error(
            'Error fetching course intakes by slug:',
            error instanceof Error
                ? { message: error.message }
                : { message: String(error) }
        );
        return {
            success: false,
            error: `Failed to fetch intakes for course ${slug}`,
            code: 'FETCH_ERROR',
        };
    }
}

// Cached versions using React cache
export const getCachedAllIntakes = cache(getAllIntakes);
export const getCachedIntakeById = cache(getIntakeById);
export const getCachedCourseIntakesBySlug = cache(getCourseIntakesBySlug);
export const getCachedUpcomingIntakes = cache(getUpcomingIntakes);
export const getCachedCourseActiveIntakes = cache(getActiveIntakesByCourseId);
