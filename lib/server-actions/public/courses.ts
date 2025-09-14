'use server';

import {
    and,
    asc,
    eq,
    exists,
    gte,
    ilike,
    lte,
    ne,
    type SQL,
    sql,
} from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import { buildFilterConditions, buildWhereClause } from '@/lib/utils/query-utils';

import { courseCategories } from '@/lib/db/schema/course-categories';
import { courses } from '@/lib/db/schema/courses';
import { intakes } from '@/lib/db/schema/intakes';

type Filters = {
    title?: string;
    category?: string;
    duration?: number;
    intake_date?: string;
};

// Column map for query utils
const publicCourseColumnMap = {
    id: courses.id,
    title: courses.title,
    created_at: courses.created_at,
    price: courses.price,
    duration_type: courses.duration_type,
    duration_value: courses.duration_value,
    level: courses.level,
    category: courseCategories.name,
};
/**
 * Get course by params
 */
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
    try {
        const offset = (page - 1) * pageSize;
        const whereConditions: SQL[] = [];

        // Build custom filter conditions for public courses
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

        // Subquery to find the next upcoming intake for each course
        const nextIntakeSubquery = db
            .select({
                course_id: intakes.course_id,
                min_start_date:
                    sql<string>`min(case when ${intakes.start_date} > now() then ${intakes.start_date} else null end)`.as(
                        'min_start_date'
                    ),
            })
            .from(intakes)
            .groupBy(intakes.course_id)
            .as('min_intake_dates');

        const nextIntakeDetails = db
            .select({
                id: intakes.id,
                course_id: intakes.course_id,
                start_date: intakes.start_date,
                capacity: intakes.capacity,
                total_registered: intakes.total_registered,
            })
            .from(intakes)
            .innerJoin(
                nextIntakeSubquery,
                and(
                    eq(intakes.course_id, nextIntakeSubquery.course_id),
                    eq(intakes.start_date, nextIntakeSubquery.min_start_date)
                )
            )
            .as('next_intake');
        const sortableColumns = {
            created_at: courses.created_at,
            name: courses.title,
            category: courseCategories.name,
            price: courses.price,
            duration_type: courses.duration_type,
            duration_value: courses.duration_value,
        };

        const orderBy =
            sortableColumns[sortBy as keyof typeof sortableColumns] ?? courses.level;

        const data = await db
            .select({
                id: courses.id,
                course_highlights: courses.courseHighlights,
                course_overview: courses.courseOverview,
                duration_type: courses.duration_type,
                duration_value: courses.duration_value,
                price: courses.price,
                created_at: courses.created_at,
                updated_at: courses.updated_at,
                title: courses.title,
                level: courses.level,
                image_url: courses.image_url,
                slug: courses.slug,
                categoryName: courseCategories.name,
                next_intake_date: nextIntakeDetails.start_date,
                next_intake_id: nextIntakeDetails.id,
                available_seats: sql<number>`coalesce(${nextIntakeDetails.capacity}, 0) - coalesce(${nextIntakeDetails.total_registered}, 0)`,
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .leftJoin(nextIntakeDetails, eq(courses.id, nextIntakeDetails.course_id))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
            .orderBy(sortOrder === 'asc' ? sql`${orderBy} asc` : sql`${orderBy} desc`)
            .groupBy(
                courses.id,
                courses.duration_type,
                courses.duration_value,
                courses.price,
                courses.created_at,
                courses.title,
                courses.level,
                courses.image_url,
                courses.slug,
                courseCategories.name,
                nextIntakeDetails.start_date,
                nextIntakeDetails.id,
                nextIntakeDetails.capacity,
                nextIntakeDetails.total_registered
            )
            .limit(pageSize)
            .offset(offset);

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

        return { success: true, data, total: totalResult[0].count };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

/**
 * Get course by ID
 */
export async function getPublicCourseById(courseId: string) {
    try {
        const result = await db
            .select()
            .from(courses)
            .where(eq(courses.id, courseId));
        return { success: true, data: result[0] };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

/**
 * Get course by slug
 */
export async function getPublicCourseBySlug(slug?: string) {
    try {
        if (!slug) {
            return { success: false, error: 'slug is not provided' };
        }

        const courseResult = await db
            .select({
                id: courses.id,
                title: courses.title,
                course_highlights: courses.courseHighlights,
                course_overview: courses.courseOverview,
                duration_value: courses.duration_value,
                duration_type: courses.duration_type,
                price: courses.price,
                image_url: courses.image_url,
                slug: courses.slug,
                category_id: courses.category_id,
                created_at: courses.created_at,
                level: courses.level,
                category: {
                    id: courseCategories.id,
                    name: courseCategories.name,
                    description: courseCategories.description,
                },
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .where(eq(courses.slug, slug));

        if (courseResult.length === 0) {
            return { success: false, error: 'Course not found' };
        }

        const courseData = courseResult[0];

        const courseIntakes = await db
            .select()
            .from(intakes)
            .where(
                and(
                    eq(intakes.course_id, courseData.id),
                    gte(intakes.end_date, new Date().toISOString())
                )
            )
            .orderBy(asc(intakes.start_date));

        return { success: true, data: { ...courseData, intakes: courseIntakes } };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}


/**
 * Fetches related courses from the same category, excluding the specified course.
 * Returns up to 3 randomly selected courses with basic course information.
 *
 * @param courseId - The ID of the current course to exclude
 * @param categoryId - The category ID to filter related courses by
 * @returns Promise containing success status and related courses data
 *
 * Performance considerations:
 * - Simple query with minimal WHERE conditions for better performance
 * - Ensure indexes exist on courses.category_id and courses.id
 */
export async function getRelatedCourses(courseId: string, categoryId: string) {
    // Input validation
    if (!courseId || !categoryId) {
        return {
            success: false,
            error: 'Course ID and Category ID are required',
        };
    }

    try {
        // Simple, fast query - get related courses from same category
        const relatedCourses = await db
            .select({
                id: courses.id,
                title: courses.title,
                slug: courses.slug,
                course_overview: courses.courseOverview,
                course_highlights: courses.courseHighlights,
                image_url: courses.image_url,
                price: courses.price,
                categoryName: courseCategories.name,
                level: courses.level,
                duration_value: courses.duration_value,
                duration_type: courses.duration_type,
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .where(and(
                eq(courses.category_id, categoryId),
                ne(courses.id, courseId)
            ))
            .orderBy(sql`random()`)
            .limit(3);

        return {
            success: true,
            data: relatedCourses
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to fetch related courses: ${errorMessage}`,
        };
    }
}
export async function getNewCourses() {
    try {
        const newCourses = await db
            .select({
                id: courses.id,
                title: courses.title,
                slug: courses.slug,
                course_overview: courses.courseOverview,
                course_highlights: courses.courseHighlights,
                level: courses.level,
                duration_value: courses.duration_value,
                duration_type: courses.duration_type,
                image_url: courses.image_url,
                price: courses.price,
                next_intake_date:
                    sql<string>`min(case when ${intakes.start_date} > now() then ${intakes.start_date} else null end)`.as(
                        'next_intake_date'
                    ),
                next_intake_id: intakes.id,
                available_seats: sql<number>`coalesce(${intakes.capacity}, 0) - coalesce(${intakes.total_registered}, 0)`,
                categoryName: courseCategories.name,
            })
            .from(courses)
            .leftJoin(courseCategories, eq(courses.category_id, courseCategories.id))
            .leftJoin(intakes, eq(courses.id, intakes.course_id))
            .groupBy(
                courses.id,
                courseCategories.name,
                intakes.id,
                intakes.capacity,
                intakes.total_registered
            )
            .orderBy(courses.created_at, sql`desc`)
            .limit(3);

        return { success: true, data: newCourses };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to fetch new courses: ${errorMessage}`,
        };
    }
}

// Cached versions using React cache
export const getCachedNewCourses = cache(getNewCourses);
export const getCachedRelatedCourses = cache(getRelatedCourses);
export const getCachedPublicCourses = cache(getPublicCourses);
export const getCachedPublicCourseById = cache(getPublicCourseById);
export const getCachedPublicCourseBySlug = cache(getPublicCourseBySlug);
