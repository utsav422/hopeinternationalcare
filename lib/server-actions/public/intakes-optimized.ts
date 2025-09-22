'use server';

import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import { 
  courses, 
  intakes 
} from '@/lib/db/schema';
import { 
  PublicIntakeListItem,
  PublicIntakeDetail,
  ActiveIntake,
  UpcomingIntake,
  CourseIntakeBySlug,
  ApiResponse
} from '@/lib/types/public/intakes';
import { logger } from '@/lib/utils/logger';

/**
 * Get active intakes by course ID
 */
export async function getActiveIntakesByCourseId(courseId: string): Promise<ApiResponse<ActiveIntake[]>> {
  try {
    if (!courseId) {
      return {
        success: false,
        error: 'Course ID is required',
        code: 'MISSING_COURSE_ID'
      };
    }
    
    const today = new Date().toISOString();
    const courseIntakes = await db.query.intakes.findMany({
      where: and(
        eq(intakes.course_id, courseId),
        gte(intakes.start_date, today), // Only active and upcoming intakes
        eq(intakes.is_open, true) // Only open intakes
      ),
      orderBy: (intakes, { asc }) => [asc(intakes.start_date)],
    });
    
    return { success: true, data: courseIntakes };
  } catch (error: unknown) {
    logger.error('Error fetching active intakes by course ID:', error);
    return {
      success: false,
      error: 'Failed to fetch course intakes',
      code: 'FETCH_ERROR'
    };
  }
}

/**
 * Get intake by ID
 */
export async function getIntakeById(intakeId: string): Promise<ApiResponse<PublicIntakeDetail>> {
  try {
    if (!intakeId) {
      return {
        success: false,
        error: 'Intake ID is required',
        code: 'MISSING_INTAKE_ID'
      };
    }
    
    const [data] = await db
      .select()
      .from(intakes)
      .where(eq(intakes.id, intakeId))
      .limit(1);

    return { success: true, data };
  } catch (error: unknown) {
    logger.error('Error fetching intake by ID:', error);
    return {
      success: false,
      error: 'Failed to fetch course intakes',
      code: 'FETCH_ERROR'
    };
  }
}

/**
 * Get upcoming intakes
 */
export async function getUpcomingIntakes(): Promise<ApiResponse<UpcomingIntake[]>> {
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
      .where(and(gte(intakes.start_date, today), eq(intakes.is_open, true)))
      .orderBy(intakes.start_date)
      .limit(5);

    logger.debug('Upcoming Intakes:', { count: upcomingIntakes.length });

    return { success: true, data: upcomingIntakes };
  } catch (error) {
    logger.error('Error fetching upcoming intakes:', error);
    return {
      success: false,
      error: 'Failed to fetch upcoming intakes',
      code: 'FETCH_ERROR'
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
    
    return { success: true, data: allIntakes };
  } catch (error: unknown) {
    logger.error('Error fetching all intakes:', error);
    return {
      success: false,
      error: 'Failed to fetch all intakes',
      code: 'FETCH_ERROR'
    };
  }
}

/**
 * Get course intakes by slug
 */
export async function getCourseIntakesBySlug(slug: string): Promise<ApiResponse<CourseIntakeBySlug[]>> {
  try {
    if (!slug) {
      return { 
        success: false, 
        error: 'Slug is required',
        code: 'MISSING_SLUG'
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

    return { success: true, data: courseIntakes };
  } catch (error: unknown) {
    logger.error('Error fetching course intakes by slug:', error);
    return {
      success: false,
      error: `Failed to fetch intakes for course ${slug}`,
      code: 'FETCH_ERROR'
    };
  }
}

// Cached versions using React cache
export const getCachedAllIntakes = cache(getAllIntakes);
export const getCachedIntakeById = cache(getIntakeById);
export const getCachedCourseIntakesBySlug = cache(getCourseIntakesBySlug);
export const getCachedUpcomingIntakes = cache(getUpcomingIntakes);
export const getCachedCourseActiveIntakes = cache(getActiveIntakesByCourseId);