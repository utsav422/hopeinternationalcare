// /server-action/public/courses.ts
'use server';

import { and, eq, exists, gte, ilike, lte, type SQL, sql } from 'drizzle-orm';
import { db } from '@/utils/db/drizzle';
import { courseCategories } from '@/utils/db/schema/course-categories';
import { courses } from '@/utils/db/schema/courses';
import { intakes } from '@/utils/db/schema/intakes';

type Filters = {
  title?: string;
  category?: string;
  duration?: number;
  intake_date?: string;
};

export async function getPublicCourses({
  page = 1,
  pageSize = 10,
  filters = {},
  sortBy = 'created_at',
  sortOrder = 'desc',
}: {
  page?: number;
  pageSize?: number;
  filters?: Filters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const offset = (page - 1) * pageSize;
  const whereConditions: SQL[] = [];

  if (filters.title) {
    whereConditions.push(ilike(courses.title, `%${filters.title}%`));
  }
  if (filters.category) {
    whereConditions.push(eq(courseCategories.id, filters.category));
  }
  if (filters.duration) {
    whereConditions.push(eq(courses.duration_value, filters.duration));
  }
  if (filters.intake_date) {
    const date = new Date(filters.intake_date);
    if (!Number.isNaN(date.getTime())) {
      whereConditions.push(
        exists(
          db
            .select({ n: sql`1` })
            .from(intakes)
            .where(
              and(
                eq(intakes.course_id, courses.id),
                lte(intakes.start_date, date.toISOString()),
                gte(intakes.end_date, date.toISOString())
              )
            )
        )
      );
    }
  }

  const nextIntakeSubquery = db
    .select({
      course_id: intakes.course_id,
      start_date: sql<string>`min(case when ${intakes.start_date} > now() then ${intakes.start_date} else null end)`.as('next_intake_date'),
      capacity: intakes.capacity,
      total_registered: intakes.total_registered,
    })
    .from(intakes)
    .groupBy(intakes.course_id, intakes.capacity, intakes.total_registered)
    .as('next_intake');

  const sortableColumns = {
    created_at: courses.created_at,
    name: courses.title,
    category: courseCategories.name,
    price: courses.price,
    duration_type: courses.duration_type,
    duration_value: courses.duration_value,
  };

  const orderBy = sortableColumns[sortBy as keyof typeof sortableColumns] ?? courses.level;

  const data = await db
    .select({
      id: courses.id,
      description: courses.description,
      duration_type: courses.duration_type,
      duration_value: courses.duration_value,
      price: courses.price,
      cr_aatedAt: courses.created_at,
      title: courses.title,
      level: courses.level,
      _umageUrl: courses.image_url,
      slug: courses.slug,
      categoryName: courseCategories.name,
      next_intake_date: nextIntakeSubquery.start_date,
      available_seats: sql<number>`${nextIntakeSubquery.capacity} - ${nextIntakeSubquery.total_registered}`,
    })
    .from(courses)
    .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
    .leftJoin(nextIntakeSubquery, eq(courses.id, nextIntakeSubquery.course_id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(sortOrder === 'asc' ? sql`${orderBy} asc` : sql`${orderBy} desc`)
    .groupBy(
      courses.id,
      courses.description,
      courses.duration_type,
      courses.duration_value,
      courses.price,
      courses.created_at,
      courses.title,
      courses.level,
      courses.image_url,
      courses.slug,
      courseCategories.name,
      nextIntakeSubquery.start_date,
      nextIntakeSubquery.capacity,
      nextIntakeSubquery.total_registered
    )
    .limit(pageSize)
    .offset(offset);

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(courses)
    .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

  return { data, total: totalResult[0].count };
}

/**
 * Get course by ID
 */
export async function getPublicCourseById(courseId: string) {
  const result = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId));
  return { data: result[0] };
}

/**
 * Get course by slug
 */
export async function getPublicCourseBySlug(slug?: string) {
  if (!slug) {
    throw new Error('slug is not provided');
  }
  const result = await db.select().from(courses).where(eq(courses.slug, slug));
  if (result.length === 0) {
    return null;
  }
  return { data: result[0] };
}
