import type { ColumnFiltersState } from '@tanstack/react-table';
import type { AnyColumn, SQL } from 'drizzle-orm';
import { asc, desc, sql } from 'drizzle-orm';

/**
 * Builds filter conditions from column filters
 */
export function buildFilterConditions(
  filters: ColumnFiltersState,
  columnMap: Record<string, AnyColumn>
): SQL<unknown>[] {
  return filters
    .map((filter: any) => {
      const col = columnMap[filter.id];

      if (col && typeof filter.value === 'string') {
        // Text search using ILIKE for case-insensitive matching
        return sql`${col} ILIKE ${`%${filter.value}%`}`;
      }

      if (
        col &&
        Array.isArray(filter.value) &&
        filter.value.length > 0
      ) {
        // For array filters, use IN clause
        return sql`${col} IN ${filter.value}`;
      }

      // Handle numeric range filters [min, max]
      if (
        col &&
        Array.isArray(filter.value) &&
        filter.value.length === 2 &&
        typeof filter.value[0] === 'number' &&
        typeof filter.value[1] === 'number'
      ) {
        const [min, max] = filter.value;
        const conditions: SQL[] = [];
        if (min !== undefined && min !== null) {
          conditions.push(sql`${col} >= ${min}`);
        }
        if (max !== undefined && max !== null) {
          conditions.push(sql`${col} <= ${max}`);
        }
        if (conditions.length > 0) {
          return conditions.length > 1
            ? sql`${conditions[0]} AND ${conditions[1]}`
            : conditions[0];
        }
      }

      // Handle single numeric value filters (e.g., exact match)
      if (col && typeof filter.value === 'number') {
        return sql`${col} = ${filter.value}`;
      }

      return null;
    })
    .filter(Boolean) as SQL<unknown>[];
}

/**
 * Builds WHERE clause from filter conditions
 */
export function buildWhereClause(filterConditions: SQL<unknown>[]) {
  return filterConditions.length > 0
    ? filterConditions.reduce((acc, condition) =>
      acc ? sql`${acc} AND ${condition}` : condition
    )
    : undefined;
}

/**
 * Builds ORDER BY clause
 */
export function buildOrderByClause(
  sortBy: string,
  order: 'asc' | 'desc',
  columnMap: Record<string, AnyColumn>
) {
  const sortColumn = columnMap[sortBy];
  if (!sortColumn) {
    // Default to created_at if sort column not found
    const defaultColumn = Object.values(columnMap).find(col =>
      col.name === 'created_at' || col.name === 'id'
    );
    return defaultColumn ? desc(defaultColumn) : undefined;
  }

  return order === 'asc' ? asc(sortColumn) : desc(sortColumn);
}

/**
 * Calculates offset for pagination
 */
export function calculateOffset(page: number, pageSize: number) {
  return (page - 1) * pageSize;
}

/**
 * Builds a complete query with pagination, filtering, and sorting
 */
export function buildPaginatedQuery({
  queryBuilder,
  columnMap,
  options,
}: {
  queryBuilder: any;
  columnMap: Record<string, AnyColumn>;
  options: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    filters?: ColumnFiltersState;
  };
}) {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'created_at',
    order = 'desc',
    filters = []
  } = options;

  const offset = calculateOffset(page, pageSize);

  // Build filter conditions
  const filterConditions = buildFilterConditions(filters, columnMap);
  const whereClause = buildWhereClause(filterConditions);

  // Build order by clause
  const orderBy = buildOrderByClause(sortBy, order, columnMap);

  // Apply where clause if exists
  let query = whereClause ? queryBuilder.where(whereClause) : queryBuilder;

  // Apply order by if exists
  if (orderBy) {
    query = query.orderBy(orderBy);
  }

  // Apply pagination
  query = query.limit(pageSize).offset(offset);

  return query;
}

/**
 * Builds a count query for pagination
 */
export function buildCountQuery({
  table,
  columnMap,
  filters = [],
}: {
  table: any;
  columnMap: Record<string, AnyColumn>;
  filters?: ColumnFiltersState;
}) {
  // Build filter conditions
  const filterConditions = buildFilterConditions(filters, columnMap);
  const whereClause = buildWhereClause(filterConditions);

  // Build count query
  let query = table
    .select({ count: sql<number>`count(*)` })
    .from(table);

  if (whereClause) {
    query = query.where(whereClause);
  }

  return query;
}