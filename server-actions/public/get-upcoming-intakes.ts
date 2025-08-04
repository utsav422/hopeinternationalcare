'use server';

import { db } from '@/utils/db/drizzle';
import { intakes } from '@/utils/db/schema/intakes';
import { courses } from '@/utils/db/schema/courses';
import { sql, gte, and, eq } from 'drizzle-orm';

export async function getUpcomingIntakes() {
  const today = new Date().toISOString();

  try {
    const upcomingIntakes = await db.select({
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

    console.log('Upcoming Intakes:', upcomingIntakes);

    return { data: upcomingIntakes };
  } catch (error) {
    console.error('Error fetching upcoming intakes:', error);
    return { error: 'Failed to fetch upcoming intakes.' };
  }
}
