import { AffiliationInsert } from './../../types/affiliations/index';
'use server';

import { Column, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { affiliations } from '@/lib/db/schema/affiliations';
import { courses } from '@/lib/db/schema/courses';
import { requireAdmin } from '@/lib/middleware/auth-guard';
import { logger } from '@/lib/utils/logger';
import {
    AffiliationInsert as NewAffiliation,
    AffiliationListItem,
    AffiliationWithDetails,
    AffiliationQueryParams,
    AffiliationCreateData,
    AffiliationUpdateData,
    AffiliationConstraintCheck,
    AffiliationBase,
    ApiResponse,
    PaginationResponse
} from '@/lib/types';
import {
    AffiliationValidationError
} from '@/lib/utils/affiliations';
import {
    validateAffiliationData,
    checkAffiliationConstraints
} from '@/lib/utils/affiliations';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '../../utils/query-utils';



// Type for new affiliation


// Column mappings for affiliations
const affiliationColumnMap: Record<string, Column> = {
    id: affiliations.id,
    name: affiliations.name,
    type: affiliations.type,
    description: affiliations.description,
    created_at: affiliations.created_at,
    updated_at: affiliations.updated_at,
};

/**
 * Error handling utility
 */
export function handleAffiliationError(error: unknown, operation: string): ApiResponse<never> {
    if (error instanceof AffiliationValidationError) {
        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
        };
    }

    if (error instanceof Error) {
        logger.error(`Affiliation ${operation} failed:`, { error: error.message });
        return {
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR'
        };
    }

    logger.error(`Unexpected error in affiliation ${operation}:`, { error: String(error) });
    return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
    };
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminAffiliationList(params: AffiliationQueryParams): Promise<ApiResponse<{
    data: AffiliationListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    try {
        await requireAdmin();

        const {
            page = 1,
            pageSize = 10,
            sortBy = 'created_at',
            order = 'desc',
            filters = [],
            search
        } = params;

        const offset = (page - 1) * pageSize;

        // Build filter conditions
        const filterConditions = buildFilterConditions(filters, affiliationColumnMap);

        // Add search condition if provided
        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(
                sql`(${affiliations.name} ILIKE ${searchFilter} OR ${affiliations.description} ILIKE ${searchFilter})`
            );
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, affiliationColumnMap);

        // Main query with filters, pagination, and joins
        const query = db
            .select({
                id: affiliations.id,
                name: affiliations.name,
                type: affiliations.type,
                description: affiliations.description,
                created_at: affiliations.created_at,
                updated_at: affiliations.updated_at,
                course_count: sql<number>`count(${courses.id})`,
            })
            .from(affiliations)
            .leftJoin(courses, eq(affiliations.id, courses.affiliation_id))
            .groupBy(
                affiliations.id,
                affiliations.name,
                affiliations.type,
                affiliations.description,
                affiliations.created_at,
                affiliations.updated_at
            )
            .limit(pageSize)
            .offset(offset);

        // Apply where clause if exists
        const queryWithWhere = whereClause ? query.where(whereClause) : query;

        // Apply order by
        const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;

        // Count query with same filters
        const countQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(affiliations)
            .leftJoin(courses, eq(affiliations.id, courses.affiliation_id));

        // Apply where clause to count query if exists
        const countQueryWithWhere = whereClause ? countQuery.where(whereClause) : countQuery;

        const [data, countResult] = await Promise.all([
            queryWithOrder,
            db.select({ count: sql<number>`count(*)` }).from(countQueryWithWhere.as('count_subquery'))
        ]);

        return {
            success: true,
            data: {
                data,
                total: countResult[0]?.count || 0,
                page,
                pageSize
            }
        };
    } catch (error) {
        return handleAffiliationError(error, 'list');
    }
}

/**
 * Single comprehensive details function with proper joins
 */
export async function adminAffiliationDetails(id: string): Promise<ApiResponse<AffiliationWithDetails>> {
    try {
        await requireAdmin();

        // Get affiliation with courses
        const affiliationResult = await db
            .select()
            .from(affiliations)
            .where(eq(affiliations.id, id))
            .limit(1);

        if (affiliationResult.length === 0) {
            return {
                success: false,
                error: 'Affiliation not found',
                code: 'NOT_FOUND'
            };
        }

        const affiliation = affiliationResult[0];

        // Get associated courses
        const courseResult = await db
            .select()
            .from(courses)
            .where(eq(courses.affiliation_id, id));

        return {
            success: true,
            data: {
                affiliation,
                courses: courseResult
            }
        };
    } catch (error) {
        return handleAffiliationError(error, 'details');
    }
}

/**
 * Optimized CRUD operations with validation
 */
export async function adminAffiliationCreate(data: AffiliationCreateData): Promise<ApiResponse<NewAffiliation>> {
    try {
        await requireAdmin();

        // Validate data
        const validation = validateAffiliationData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details
            };
        }

        const values: NewAffiliation = {
            name: data.name,
            type: data.type,
            description: data.description,
        };

        const [created] = await db
            .insert(affiliations)
            .values(values)
            .returning();

        revalidatePath('/admin/affiliations');
        return { success: true, data: created };
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
            return {
                success: false,
                error: 'An affiliation with this name already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION'
            };
        }

        return handleAffiliationError(error, 'create');
    }
}

export async function adminAffiliationUpdate(data: AffiliationUpdateData): Promise<ApiResponse<NewAffiliation>> {
    try {
        await requireAdmin();

        // Validate data
        const validation = validateAffiliationData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details
            };
        }

        const values = {
            name: data.name,
            type: data.type,
            description: data.description,
            updated_at: sql`now()`,
        };

        const [updated] = await db
            .update(affiliations)
            .set(values)
            .where(eq(affiliations.id, data.id))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Affiliation not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath('/admin/affiliations');
        revalidatePath(`/admin/affiliations/${data.id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
            return {
                success: false,
                error: 'An affiliation with this name already exists.',
                code: 'UNIQUE_CONSTRAINT_VIOLATION'
            };
        }

        return handleAffiliationError(error, 'update');
    }
}

export async function adminAffiliationDelete(id: string): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        // Check constraints before deletion
        const constraints = await checkAffiliationConstraints(id);
        if (!constraints.canDelete) {
            return {
                success: false,
                error: `Cannot delete: referenced by ${constraints.courseCount} course(s). Update or remove those courses first.`,
                code: 'CONSTRAINT_VIOLATION',
                details: { courseCount: constraints.courseCount }
            };
        }

        const [deleted] = await db
            .delete(affiliations)
            .where(eq(affiliations.id, id))
            .returning();

        if (!deleted) {
            return {
                success: false,
                error: 'Affiliation not found',
                code: 'NOT_FOUND'
            };
        }

        revalidatePath('/admin/affiliations');
        return { success: true };
    } catch (error) {
        return handleAffiliationError(error, 'delete');
    }
}

/**
 * Business-specific operations
 */
export async function adminAffiliationCheckConstraints(id: string): Promise<ApiResponse<AffiliationConstraintCheck>> {
    try {
        await requireAdmin();

        const result = await checkAffiliationConstraints(id);
        return { success: true, data: result };
    } catch (error) {
        return handleAffiliationError(error, 'constraint-check');
    }
}