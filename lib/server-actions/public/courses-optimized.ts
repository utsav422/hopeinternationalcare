'use server';

import { and, asc, eq, exists, gte, ilike, lte, ne, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import { 
  courses, 
  courseCategories, 
  intakes 
} from '@/lib/db/schema';
import { 
  PublicCourseListItem, 
  PublicCourseDetail, 
  PublicCourseQueryParams, 
  RelatedCourse, 
  NewCourse,
  ApiResponse
} from '@/lib/types/public/courses';
import { 
  validateCourseQueryParams,
  buildPublicCourseFilterConditions,
  PublicCourseValidationError
} from '@/lib/utils/public/courses';
import { buildFilterConditions, buildWhereClause } from '@/lib/utils/query-utils';
import { logger } from '@/lib/utils/logger';

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
 * Error handling utility
 */
export function handlePublicCourseError(error: unknown, operation: string): ApiResponse<never> {
  if (error instanceof PublicCourseValidationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  if (error instanceof Error) {
    logger.error(`Public Course ${operation} failed:`, error);
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }
  
  logger.error(`Unexpected error in public course ${operation}:`, error);
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Get public courses with filtering, pagination, and sorting
 */
export async function getPublicCourses(params: PublicCourseQueryParams): Promise<ApiResponse<{
  data: PublicCourseListItem[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  try {
    // Validate parameters
    const validation = validateCourseQueryParams(params);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error || 'Validation failed',
        code: validation.code || 'VALIDATION_ERROR',
        details: validation.details
      };
    }
    
    const {
      page = 1,
      pageSize = 10,
      filters = {},
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = params;
    
    const offset = (page - 1) * pageSize;
    
    // Build filter conditions
    const filterConditions = buildPublicCourseFilterConditions(filters);
    
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

    const orderBy = sortableColumns[sortBy as keyof typeof sortableColumns] ?? courses.created_at;

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
      .where(filterConditions.length > 0 ? and(...filterConditions) : undefined)
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
      .where(filterConditions.length > 0 ? and(...filterConditions) : undefined);

    return { 
      success: true, 
      data: {
        data,
        total: totalResult[0].count,
        page,
        pageSize
      }
    };
  } catch (error) {
    return handlePublicCourseError(error, 'list');
  }
}

/**
 * Get course by ID
 */
export async function getPublicCourseById(courseId: string): Promise<ApiResponse<PublicCourseDetail>> {
  try {
    if (!courseId) {
      return {
        success: false,
        error: 'Course ID is required',
        code: 'MISSING_COURSE_ID'
      };
    }

    const result = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));
      
    if (result.length === 0) {
      return {
        success: false,
        error: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      };
    }
    
    return { success: true, data: result[0] };
  } catch (error) {
    return handlePublicCourseError(error, 'get-by-id');
  }
}

/**
 * Get course by slug
 */
export async function getPublicCourseBySlug(slug: string): Promise<ApiResponse<PublicCourseDetail>> {
  try {
    if (!slug) {
      return {
        success: false,
        error: 'Slug is required',
        code: 'MISSING_SLUG'
      };
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
      return {
        success: false,
        error: 'Course not found',
        code: 'COURSE_NOT_FOUND'
      };
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

    return { 
      success: true, 
      data: { 
        ...courseData, 
        intakes: courseIntakes 
      } 
    };
  } catch (error) {
    return handlePublicCourseError(error, 'get-by-slug');
  }
}

/**
 * Get related courses from the same category
 */
export async function getRelatedCourses(courseId: string, categoryId: string): Promise<ApiResponse<RelatedCourse[]>> {
  // Input validation
  if (!courseId || !categoryId) {
    return {
      success: false,
      error: 'Course ID and Category ID are required',
      code: 'MISSING_PARAMETERS'
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
    return handlePublicCourseError(error, 'get-related');
  }
}

/**
 * Get new courses
 */
export async function getNewCourses(): Promise<ApiResponse<NewCourse[]>> {
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
    return handlePublicCourseError(error, 'get-new');
  }
}

// Cached versions using React cache
export const getCachedNewCourses = cache(getNewCourses);
export const getCachedRelatedCourses = cache(getRelatedCourses);
export const getCachedPublicCourses = cache(getPublicCourses);
export const getCachedPublicCourseById = cache(getPublicCourseById);
export const getCachedPublicCourseBySlug = cache(getPublicCourseBySlug);