'use server';

import { db } from '@/utils/db/drizzle';
import { courses } from '@/utils/db/schema/courses';
import { eq, ne, and, sql } from 'drizzle-orm';
import { courseCategories } from '@/utils/db/schema/course-categories';
import { intakes } from '@/utils/db/schema/intakes';

export async function getRelatedCourses(courseId: string, categoryId: string) {
  try {
    const relatedCourses = await db.select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      image_url: courses.image_url,
      price: courses.price,
      next_intake_date: sql<string>`min(case when ${intakes.start_date} > now() then ${intakes.start_date} else null end)`.as('next_intake_date'),
      next_intake_id: intakes.id,
      available_seats: sql<number>`coalesce(${intakes.capacity}, 0) - coalesce(${intakes.total_registered}, 0)`,
      categoryName: courseCategories.name,
    })
    .from(courses)
    .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
    .leftJoin(intakes, eq(courses.id, intakes.course_id))
    .where(and(eq(courses.category_id, categoryId), ne(courses.id, courseId)))
    .groupBy(courses.id, courseCategories.name, intakes.id, intakes.capacity, intakes.total_registered)
    .orderBy(sql`random()`)
    .limit(3);

    return { data: relatedCourses };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to fetch related courses: ${errorMessage}` };
  }
}
