import { AnyColumn, SQL, sql } from 'drizzle-orm';
import { courses } from '@/lib/db/schema/courses';
import { courseCategories } from '@/lib/db/schema/course-categories';
import { affiliations } from '@/lib/db/schema/affiliations';
import {
    buildFilterConditions,
    buildWhereClause,
    buildOrderByClause,
} from '@/lib/utils/query-utils';
import type { ColumnFiltersState } from '@tanstack/react-table';

/**
 * Builds pagination, filtering, and sorting utilities for courses
 */

// Define column mappings for courses with joins
export const courseColumnMap: Record<string, AnyColumn> = {
    id: courses.id,
    title: courses.title,
    slug: courses.slug,
    courseHighlights: courses.courseHighlights,
    courseOverview: courses.courseOverview,
    image_url: courses.image_url,
    level: courses.level,
    price: courses.price,
    category_id: courses.category_id,
    affiliation_id: courses.affiliation_id,
    duration_type: courses.duration_type,
    duration_value: courses.duration_value,
    created_at: courses.created_at,
    updated_at: courses.updated_at,
    category_name: courseCategories.name,
    affiliation_name: affiliations.name,
};

// Define columns to select for courses with joins
export const courseSelectColumns = {
    id: courses.id,
    title: courses.title,
    slug: courses.slug,
    courseHighlights: courses.courseHighlights,
    courseOverview: courses.courseOverview,
    image_url: courses.image_url,
    level: courses.level,
    price: courses.price,
    category_id: courses.category_id,
    affiliation_id: courses.affiliation_id,
    duration_type: courses.duration_type,
    duration_value: courses.duration_value,
    created_at: courses.created_at,
    updated_at: courses.updated_at,
    category_name: courseCategories.name,
    affiliation_name: affiliations.name,
};

/**
 * Builds filter conditions for courses with related data (categories, affiliations)
 */
export function buildCourseFilterConditions(
    filters: ColumnFiltersState
): SQL<unknown>[] {
    return buildFilterConditions(filters, courseColumnMap);
}

/**
 * Builds WHERE clause for courses with related data
 */
export function buildCourseWhereClause(filterConditions: SQL<unknown>[]) {
    return buildWhereClause(filterConditions);
}

/**
 * Builds ORDER BY clause for courses with related data
 */
export function buildCourseOrderByClause(
    sortBy: string,
    order: 'asc' | 'desc'
) {
    return buildOrderByClause(sortBy, order, courseColumnMap);
}

/**
 * Calculates offset for pagination
 */
export function calculateCourseOffset(page: number, pageSize: number) {
    return (page - 1) * pageSize;
}

/**
 * Builds a paginated query for courses with related data
 */
export function buildPaginatedCourseQuery({
    page = 1,
    pageSize = 10,
    sortBy = 'created_at',
    order = 'desc',
    filters = [],
}: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
}) {
    const offset = calculateCourseOffset(page, pageSize);

    // Build filter conditions
    const filterConditions = buildCourseFilterConditions(filters);
    const whereClause = buildCourseWhereClause(filterConditions);

    // Build order by clause
    const orderBy = buildCourseOrderByClause(sortBy, order);

    // Base query with joins
    let baseQuery = sql`
    SELECT 
      ${sql.join(
          Object.entries(courseSelectColumns).map(
              ([alias, column]) => sql`${column} AS ${sql.identifier(alias)}`
          ),
          sql`, `
      )}
    FROM ${courses}
    LEFT JOIN ${courseCategories} ON ${courses.category_id} = ${
        courseCategories.id
    }
    LEFT JOIN ${affiliations} ON ${courses.affiliation_id} = ${affiliations.id}
  `;

    // Apply WHERE clause if exists
    if (whereClause) {
        baseQuery = sql`${baseQuery} WHERE ${whereClause}`;
    }

    // Apply ORDER BY clause if exists
    if (orderBy) {
        baseQuery = sql`${baseQuery} ORDER BY ${orderBy}`;
    }

    // Apply pagination
    baseQuery = sql`${baseQuery} LIMIT ${pageSize} OFFSET ${offset}`;

    return baseQuery;
}

/**
 * Builds a count query for courses with related data
 */
export function buildCourseCountQuery({
    filters = [],
}: {
    filters?: ColumnFiltersState;
}) {
    // Build filter conditions
    const filterConditions = buildCourseFilterConditions(filters);
    const whereClause = buildCourseWhereClause(filterConditions);

    // Base count query with joins
    let countQuery = sql`
    SELECT COUNT(*) AS count
    FROM ${courses}
    LEFT JOIN ${courseCategories} ON ${courses.category_id} = ${courseCategories.id}
    LEFT JOIN ${affiliations} ON ${courses.affiliation_id} = ${affiliations.id}
  `;

    // Apply WHERE clause if exists
    if (whereClause) {
        countQuery = sql`${countQuery} WHERE ${whereClause}`;
    }

    return countQuery;
}
