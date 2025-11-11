import { AnyColumn, SQL, sql, asc, desc } from 'drizzle-orm';
import type { ColumnFiltersState } from '@tanstack/react-table';

/**
 * Query optimization utilities for all modules
 */
function isUUID(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        str
    );
}
// Build filter conditions from column filters
export function buildFilterConditions(
    filters: ColumnFiltersState,
    columnMap: Record<string, AnyColumn>
): SQL<unknown>[] {
    return filters
        ?.map(filter => {
            const column = columnMap[filter.id];
            if (!column) return null;

            // Handle different filter types
            if (typeof filter.value === 'string') {
                const value = filter.value.trim();
                // UUIDs should be exact match
                if (isUUID(value)) {
                    return sql`${column} = ${value}`;
                }
                // String filters
                if (value.includes('%')) {
                    // Already has wildcards
                    return sql`${column} ILIKE ${value}`;
                } else {
                    // Add wildcards for partial matching
                    return sql`${column} ILIKE ${`%${value}%`}`;
                }
            } else if (typeof filter.value === 'number') {
                // Number filters
                return sql`${column} = ${filter.value}`;
            } else if (Array.isArray(filter.value)) {
                // Array filters (for IN clauses)
                if (filter.value.length > 0) {
                    return sql`${column} IN ${filter.value}`;
                }
            } else if (filter.value && typeof filter.value === 'object') {
                // Object filters (for range queries)
                const objValue = filter.value as Record<string, any>;
                if (objValue.from !== undefined && objValue.to !== undefined) {
                    return sql`${column} BETWEEN ${objValue.from} AND ${objValue.to}`;
                } else if (objValue.from !== undefined) {
                    return sql`${column} >= ${objValue.from}`;
                } else if (objValue.to !== undefined) {
                    return sql`${column} <= ${objValue.to}`;
                }
            }

            return null;
        })
        .filter((condition): condition is SQL<unknown> => condition !== null);
}

// Build WHERE clause from filter conditions
export function buildWhereClause(
    filterConditions: SQL<unknown>[]
): SQL<unknown> | undefined {
    if (filterConditions?.length === 0) {
        return undefined;
    }

    if (filterConditions?.length === 1) {
        return filterConditions[0];
    }

    // Combine conditions with AND
    return filterConditions?.reduce((acc, condition) => {
        return sql`${acc} AND ${condition}`;
    });
}

// Build ORDER BY clause
export function buildOrderByClause(
    sortBy: string,
    order: 'asc' | 'desc',
    columnMap: Record<string, AnyColumn>
): SQL<unknown> | undefined {
    const column = columnMap[sortBy];
    if (!column) {
        return undefined;
    }

    return order === 'asc' ? asc(column) : desc(column);
}

// Calculate offset for pagination
export function calculateOffset(page: number, pageSize: number): number {
    return (page - 1) * pageSize;
}

// Build SELECT clause with optimized columns
export function buildSelectClause<T>(selectColumns: T): T {
    // In a real implementation, this could optimize the select clause
    // For now, we just return the provided columns
    return selectColumns;
}

// Build JOIN clauses for optimized queries
export function buildJoinClause(
    joins: Array<{ table: any; condition: SQL<unknown> }>
): SQL<unknown>[] {
    return joins.map(join => sql`JOIN ${join.table} ON ${join.condition}`);
}

// Build GROUP BY clause
export function buildGroupByClause(
    groupByColumns: AnyColumn[]
): SQL<unknown> | undefined {
    if (groupByColumns.length === 0) {
        return undefined;
    }

    return sql`${groupByColumns[0]}${groupByColumns
        .slice(1)
        .map(col => sql`, ${col}`)}`;
}

// Build HAVING clause
export function buildHavingClause(
    havingConditions: SQL<unknown>[]
): SQL<unknown> | undefined {
    if (havingConditions.length === 0) {
        return undefined;
    }

    if (havingConditions.length === 1) {
        return havingConditions[0];
    }

    // Combine conditions with AND
    return havingConditions.reduce((acc, condition) => {
        return sql`${acc} AND ${condition}`;
    });
}
