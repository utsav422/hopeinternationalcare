import { AnyColumn, SQL, sql } from 'drizzle-orm';
import { affiliations } from '@/lib/db/schema/affiliations';
import { courses } from '@/lib/db/schema/courses';
import {
    buildFilterConditions,
    buildWhereClause,
    buildOrderByClause,
} from '@/lib/utils/query-utils';
import type { ColumnFiltersState } from '@tanstack/react-table';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';

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
export function calculateAffiliationOffset(page: number, pageSize: number) {
    return (page - 1) * pageSize;
}

/**
 * Affiliation validation utilities
 */

export class AffiliationValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'AffiliationValidationError';
    }
}

/**
 * Validates affiliation name
 * @param name - The affiliation name to validate
 * @throws AffiliationValidationError if validation fails
 */
export function validateAffiliationName(name: string): void {
    if (name.length < 3) {
        throw new AffiliationValidationError(
            'Name must be at least 3 characters long',
            'NAME_TOO_SHORT',
            { name, length: name.length }
        );
    }

    if (name.length > 255) {
        throw new AffiliationValidationError(
            'Name cannot exceed 255 characters',
            'NAME_TOO_LONG',
            { name, length: name.length }
        );
    }
}

/**
 * Validates affiliation data
 * @param data - The affiliation data to validate
 * @returns ValidationResult
 */
export function validateAffiliationData(data: any) {
    try {
        validateAffiliationName(data.name);
        return { success: true };
    } catch (error) {
        if (error instanceof AffiliationValidationError) {
            return {
                success: false,
                error: error.message,
                code: error.code,
                details: error.details,
            };
        }
        return {
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
        };
    }
}

/**
 * Affiliation constraint checking utilities
 */

/**
 * Checks if an affiliation can be deleted (no courses associated with it)
 * @param id - The affiliation ID to check
 * @returns Object with canDelete flag and courseCount
 */
export async function checkAffiliationConstraints(
    id: string
): Promise<{ canDelete: boolean; courseCount: number }> {
    try {
        const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(courses)
            .where(eq(courses.affiliation_id, id));

        return {
            canDelete: count.toString() === '0',
            courseCount: count,
        };
    } catch (error) {
        console.error('Error checking affiliation constraints:', error);
        // In case of error, assume it cannot be deleted for safety
        return {
            canDelete: false,
            courseCount: 0,
        };
    }
}

/**
 * Business rule enforcement utilities
 */

/**
 * Checks if affiliation type can be updated
 * @param currentType - Current affiliation type
 * @param newType - New affiliation type
 * @returns boolean indicating if update is allowed
 */
export function canUpdateAffiliationType(
    currentType: string,
    newType: string
): boolean {
    // For now, allow any type update
    // This could be extended with business rules if needed
    return true;
}
