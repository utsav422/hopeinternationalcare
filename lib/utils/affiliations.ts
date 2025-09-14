import { AnyColumn, SQL, sql } from 'drizzle-orm';
import { affiliations } from '@/lib/db/schema/affiliations';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import type { ColumnFiltersState } from '@tanstack/react-table';

/**
 * Builds pagination, filtering, and sorting utilities for affiliations
 */

// Define column mappings for affiliations
export const affiliationColumnMap: Record<string, AnyColumn> = {
  id: affiliations.id,
  name: affiliations.name,
  type: affiliations.type,
  description: affiliations.description,
  created_at: affiliations.created_at,
  updated_at: affiliations.updated_at,
};

// Define columns to select for affiliations
export const affiliationSelectColumns = {
  id: affiliations.id,
  name: affiliations.name,
  type: affiliations.type,
  description: affiliations.description,
  created_at: affiliations.created_at,
  updated_at: affiliations.updated_at,
};

/**
 * Builds filter conditions for affiliations
 */
export function buildAffiliationFilterConditions(
  filters: ColumnFiltersState
): SQL<unknown>[] {
  return buildFilterConditions(filters, affiliationColumnMap);
}

/**
 * Builds WHERE clause for affiliations
 */
export function buildAffiliationWhereClause(filterConditions: SQL<unknown>[]) {
  return buildWhereClause(filterConditions);
}

/**
 * Builds ORDER BY clause for affiliations
 */
export function buildAffiliationOrderByClause(
  sortBy: string,
  order: 'asc' | 'desc'
) {
  return buildOrderByClause(sortBy, order, affiliationColumnMap);
}

/**
 * Calculates offset for pagination
 */
export function calculateOffset(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}