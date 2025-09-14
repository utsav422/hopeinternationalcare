import { AnyColumn, SQL, sql } from 'drizzle-orm';
import { courseCategories } from '@/lib/db/schema/course-categories';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import type { ColumnFiltersState } from '@tanstack/react-table';

/**
 * Builds pagination, filtering, and sorting utilities for course categories
 */

// Define column mappings for course categories
export const courseCategoryColumnMap: Record<string, AnyColumn> = {
  id: courseCategories.id,
  name: courseCategories.name,
  description: courseCategories.description,
  created_at: courseCategories.created_at,
  updated_at: courseCategories.updated_at,
};

// Define columns to select for course categories
export const courseCategorySelectColumns = {
  id: courseCategories.id,
  name: courseCategories.name,
  description: courseCategories.description,
  created_at: courseCategories.created_at,
  updated_at: courseCategories.updated_at,
};

/**
 * Builds filter conditions for course categories
 */
export function buildCourseCategoryFilterConditions(
  filters: ColumnFiltersState
): SQL<unknown>[] {
  return buildFilterConditions(filters, courseCategoryColumnMap);
}

/**
 * Builds WHERE clause for course categories
 */
export function buildCourseCategoryWhereClause(filterConditions: SQL<unknown>[]) {
  return buildWhereClause(filterConditions);
}

/**
 * Builds ORDER BY clause for course categories
 */
export function buildCourseCategoryOrderByClause(
  sortBy: string,
  order: 'asc' | 'desc'
) {
  return buildOrderByClause(sortBy, order, courseCategoryColumnMap);
}

/**
 * Calculates offset for pagination
 */
export function calculateOffset(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}