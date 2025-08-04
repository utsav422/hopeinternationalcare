'use server';

import { db } from '@/utils/db/drizzle';
import { intakes } from '@/utils/db/schema/intakes';
import { eq, gte, and } from 'drizzle-orm';

export async function getCourseIntakes(courseId: string) {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to fetch course intakes: ${errorMessage}` };
  }
}
