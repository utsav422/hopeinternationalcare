'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { customerContactReplies } from '@/lib/db/schema/customer-contact-replies';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/lib/utils/logger';
import {
    CustomerContactRequestListItem,
    CustomerContactRequestWithDetails,
    CustomerContactRequestQueryParams,
    CustomerContactRequestCreateData,
    CustomerContactRequestUpdateData,
    CustomerContactRequestConstraintCheck,
    CustomerContactRequestStatusUpdate,
    CustomerContactRequestBase,
    TypeContactRequestStatus,
} from '@/lib/types/customer-contact-requests';
import { ApiResponse } from '@/lib/types';
import {
    validateCustomerContactRequestData,
    checkCustomerContactRequestConstraints,
    CustomerContactRequestValidationError,
    canUpdateCustomerContactRequestStatus,
} from '@/lib/utils/customer-contact-requests';
import {
    buildFilterConditions,
    buildWhereClause,
    buildOrderByClause,
} from '@/lib/utils/query-utils';

// Column mappings for customer contact requests
const customerContactRequestColumnMap = {
    id: customerContactRequests.id,
    name: customerContactRequests.name,
    email: customerContactRequests.email,
    phone: customerContactRequests.phone,
    message: customerContactRequests.message,
    status: customerContactRequests.status,
    created_at: customerContactRequests.created_at,
    updated_at: customerContactRequests.updated_at,
};

/**
 * Error handling utility
 */
export async function handleCustomerContactRequestError(
    error: unknown,
    operation: string
): Promise<ApiResponse<never>> {
    if (error instanceof CustomerContactRequestValidationError) {
        return Promise.reject({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
        });
    }

    if (error instanceof Error) {
        logger.error(`Customer Contact Request ${operation} failed:`, error);
        return Promise.reject({
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR',
        });
    }

    logger.error(`Unexpected error in customer contact request ${operation}:`, {
        error: String(error),
    });
    return Promise.reject({
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    });
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminCustomerContactRequestList(
    params: CustomerContactRequestQueryParams
): Promise<
    ApiResponse<{
        data: CustomerContactRequestListItem[];
        total: number;
        page: number;
        pageSize: number;
    }>
> {
    try {
        await requireAdmin();

        const {
            page = 1,
            pageSize = 10,
            sortBy = 'created_at',
            order = 'desc',
            filters = [],
            search,
        } = params;
        const offset = (page - 1) * pageSize;

        const filterConditions = buildFilterConditions(
            filters,
            customerContactRequestColumnMap
        );

        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(
                sql`(${customerContactRequests.name} ILIKE ${searchFilter} OR ${customerContactRequests.email} ILIKE ${searchFilter} OR ${customerContactRequests.message} ILIKE ${searchFilter})`
            );
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(
            sortBy,
            order,
            customerContactRequestColumnMap
        );

        const query = db
            .select({
                id: customerContactRequests.id,
                name: customerContactRequests.name,
                email: customerContactRequests.email,
                phone: customerContactRequests.phone,
                message: customerContactRequests.message,
                status: customerContactRequests.status,
                created_at: customerContactRequests.created_at,
                updated_at: customerContactRequests.updated_at,
                reply_count:
                    sql<number>`count(${customerContactReplies.id})`.mapWith(
                        Number
                    ),
            })
            .from(customerContactRequests)
            .leftJoin(
                customerContactReplies,
                eq(
                    customerContactRequests.id,
                    customerContactReplies.contact_request_id
                )
            )
            .groupBy(customerContactRequests.id)
            .limit(pageSize)
            .offset(offset);

        const queryWithWhere = whereClause ? query.where(whereClause) : query;
        const queryWithOrder = orderBy
            ? queryWithWhere.orderBy(orderBy)
            : queryWithWhere;

        const countQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(customerContactRequests)
            .where(whereClause);

        const [results, countResult] = await Promise.all([
            queryWithOrder,
            countQuery,
        ]);

        const data: CustomerContactRequestListItem[] = results.map(item => ({
            ...item,
            status: item.status as TypeContactRequestStatus,
        }));

        return {
            success: true,
            data: {
                data,
                total: countResult[0]?.count || 0,
                page,
                pageSize,
            },
        };
    } catch (error) {
        return handleCustomerContactRequestError(error, 'list');
    }
}

/**
 * Single comprehensive details function with proper joins
 */
export async function adminCustomerContactRequestDetails(
    id: string
): Promise<ApiResponse<CustomerContactRequestWithDetails>> {
    try {
        await requireAdmin();

        const requestData = await db.query.customerContactRequests.findFirst({
            where: eq(customerContactRequests.id, id),
            with: {
                replies: true,
            },
        });

        if (!requestData) {
            return {
                success: false,
                error: 'Customer contact request not found',
                code: 'NOT_FOUND',
            };
        }

        const { replies, ...request } = requestData;

        return {
            success: true,
            data: {
                request,
                replies: replies || null,
            },
        };
    } catch (error) {
        return handleCustomerContactRequestError(error, 'details');
    }
}

/**
 * Optimized CRUD operations with validation
 */
export async function adminCustomerContactRequestCreate(
    data: CustomerContactRequestCreateData
): Promise<ApiResponse<CustomerContactRequestBase>> {
    try {
        await requireAdmin();

        const validation = validateCustomerContactRequestData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details,
            };
        }

        const [created] = await db
            .insert(customerContactRequests)
            .values({ ...data, status: 'pending' })
            .returning();

        revalidatePath('/admin/customer-contact-requests');
        return { success: true, data: created };
    } catch (error: any) {
        return handleCustomerContactRequestError(error, 'create');
    }
}

export async function adminCustomerContactRequestUpdate(
    data: CustomerContactRequestUpdateData
): Promise<ApiResponse<CustomerContactRequestBase>> {
    try {
        await requireAdmin();

        const validation = validateCustomerContactRequestData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details,
            };
        }

        const { id, ...updateData } = data;

        const [updated] = await db
            .update(customerContactRequests)
            .set({ ...updateData, updated_at: sql`now()` })
            .where(eq(customerContactRequests.id, id))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Customer contact request not found',
                code: 'NOT_FOUND',
            };
        }

        revalidatePath(`/admin/customer-contact-requests/${id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        return handleCustomerContactRequestError(error, 'update');
    }
}

export async function adminCustomerContactRequestDelete(
    id: string
): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        const constraints = await checkCustomerContactRequestConstraints(id);
        if (!constraints.canDelete) {
            return {
                success: false,
                error: 'Cannot delete this customer contact request due to business rules.',
                code: 'CONSTRAINT_VIOLATION',
            };
        }

        const [deleted] = await db
            .delete(customerContactRequests)
            .where(eq(customerContactRequests.id, id))
            .returning();

        if (!deleted) {
            return {
                success: false,
                error: 'Customer contact request not found',
                code: 'NOT_FOUND',
            };
        }

        revalidatePath('/admin/customer-contact-requests');
        return { success: true };
    } catch (error) {
        return handleCustomerContactRequestError(error, 'delete');
    }
}

/**
 * Business-specific operations
 */
export async function adminCustomerContactRequestCheckConstraints(
    id: string
): Promise<ApiResponse<CustomerContactRequestConstraintCheck>> {
    try {
        await requireAdmin();
        const result = await checkCustomerContactRequestConstraints(id);
        return { success: true, data: result };
    } catch (error) {
        return handleCustomerContactRequestError(error, 'constraint-check');
    }
}

/**
 * Status update operation
 */
export async function adminCustomerContactRequestUpdateStatus(
    data: CustomerContactRequestStatusUpdate
): Promise<ApiResponse<CustomerContactRequestBase>> {
    try {
        await requireAdmin();

        const currentRequest = await db.query.customerContactRequests.findFirst(
            {
                where: eq(customerContactRequests.id, data.id),
                columns: { status: true },
            }
        );

        if (!currentRequest) {
            return {
                success: false,
                error: 'Customer contact request not found',
                code: 'NOT_FOUND',
            };
        }

        if (
            !canUpdateCustomerContactRequestStatus(
                currentRequest.status,
                data.status
            )
        ) {
            return {
                success: false,
                error: `Cannot transition from ${currentRequest.status} to ${data.status}`,
                code: 'INVALID_STATUS_TRANSITION',
            };
        }

        const [updated] = await db
            .update(customerContactRequests)
            .set({ status: data.status, updated_at: sql`now()` })
            .where(eq(customerContactRequests.id, data.id))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: 'Customer contact request not found during update',
                code: 'NOT_FOUND',
            };
        }

        revalidatePath('/admin/customer-contact-requests');
        revalidatePath(`/admin/customer-contact-requests/${data.id}`);
        return { success: true, data: updated };
    } catch (error) {
        return handleCustomerContactRequestError(error, 'status-update');
    }
}
