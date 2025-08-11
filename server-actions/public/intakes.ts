'use server';

import { and, eq, gte, lte } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/utils/db/drizzle';
import { courses } from '@/utils/db/schema/courses';
import { intakes } from '@/utils/db/schema/intakes';
import { logger } from '@/utils/logger';
export async function getActiveIntakesByCourseId(courseId: string) {
  const today = new Date().toISOString();

  try {
    const courseIntakes = await db.query.intakes.findMany({
      where: and(
        eq(intakes.course_id, courseId),
        gte(intakes.start_date, today), // Only active and upcoming intakes
        eq(intakes.is_open, true) // Only open intakes
      ),
      orderBy: (intakes, { asc }) => [asc(intakes.start_date)],
    });
    return { data: courseIntakes };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to fetch course intakes: ${errorMessage}` };
  }
}
export async function getIntakeById(intakeId: string) {
  try {
    const [data] = await db
      .select()
      .from(intakes)
      .where(eq(intakes.id, intakeId))
      .limit(1);

    return { data };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to fetch course intakes: ${errorMessage}` };
  }
}
export async function getUpcomingIntakes() {
  const today = new Date().toISOString();

  try {
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

    return { data: upcomingIntakes };
  } catch (error) {
    logger.error('Error fetching upcoming intakes', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch upcoming intakes.',
    };
  }
}
export async function getAllIntakes() {
  const today = new Date().toISOString();

  try {
    const allIntakes = await db.query.intakes.findMany({
      where: and(
        gte(intakes.start_date, today), // Only active and upcoming intakes
        eq(intakes.is_open, true) // Only open intakes
      ),
      orderBy: (intakes, { asc }) => [asc(intakes.start_date)],
    });
    return { data: allIntakes };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to fetch all intakes: ${errorMessage}` };
  }
}
export async function getCourseIntakesBySlug(slug: string) {
  if (!slug) {
    return { error: 'Slug is required' };
  }
  try {
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

    return { data: courseIntakes };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      error: `Failed to fetch intakes for course ${slug}: ${errorMessage}`,
    };
  }
}
export const getCachedAllIntakes = cache(getAllIntakes);
export const getCachedIntakeById = cache(getIntakeById);

export const getCachedCourseIntakesBySlug = cache(getCourseIntakesBySlug);

export const getCachedUpcomingIntakes = cache(getUpcomingIntakes);
export const getCachedCourseActiveIntakes = cache(getActiveIntakesByCourseId);
