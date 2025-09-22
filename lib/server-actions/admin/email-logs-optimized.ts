'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { emailLogs, EmailLog } from '@/lib/db/schema/email-logs';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/lib/utils/logger';
import {
    EmailLogListItem,
    EmailLogQueryParams,
    EmailLogCreateData,
    EmailLogUpdateData,
    EmailLogConstraintCheck,
    EmailLogStatusUpdate,
    TypeEmailStatus
} from '@/lib/types/email-logs';
import { ApiResponse } from '@/lib/types';
import {
    validateEmailLogData,
    checkEmailLogConstraints,
    EmailLogValidationError,
    canUpdateEmailLogStatus
} from '@/lib/utils/email-logs';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';

// Column mappings for email logs
const emailLogColumnMap: Record<string, any> = {
    id: emailLogs.id,
    to_emails: emailLogs.to_emails,
    subject: emailLogs.subject,
    status: emailLogs.status,
    email_type: emailLogs.email_type,
    sent_at: emailLogs.sent_at,
    created_at: emailLogs.created_at,
    error_message: emailLogs.error_message,
};

/**
 * Error handling utility
 */
export function handleEmailLogError(error: unknown, operation: string): ApiResponse<never> {
    if (error instanceof EmailLogValidationError) {
        return {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details
        };
    }

    if (error instanceof Error) {
        logger.error(`Email Log ${operation} failed:`, error);
        return {
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR'
        };
    }

    logger.error(`Unexpected error in email log ${operation}:`, { error: String(error) });
    return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR'
    };
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminEmailLogList(params: EmailLogQueryParams): Promise<ApiResponse<{
    data: EmailLogListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    try {
        await requireAdmin();

        const { page = 1, pageSize = 10, sortBy = 'created_at', order = 'desc', filters = [], search } = params;
        const offset = (page - 1) * pageSize;

        const filterConditions = buildFilterConditions(filters, emailLogColumnMap);

        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(
                sql`(${emailLogs.subject} ILIKE ${searchFilter} OR ${emailLogs.error_message} ILIKE ${searchFilter})`
            );
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, emailLogColumnMap);

        const query = db
            .select({
                id: emailLogs.id,
                to_emails: emailLogs.to_emails,
                subject: emailLogs.subject,
                status: emailLogs.status,
                email_type: emailLogs.email_type,
                sent_at: emailLogs.sent_at,
                created_at: emailLogs.created_at,
                error_message: emailLogs.error_message,
            })
            .from(emailLogs)
            .limit(pageSize)
            .offset(offset);

        const queryWithWhere = whereClause ? query.where(whereClause) : query;
        const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;

        const countQuery = db.select({ count: sql<number>`count(*)` }).from(emailLogs);
        const countQueryWithWhere = whereClause ? countQuery.where(whereClause) : countQuery;

        const [results, countResult] = await Promise.all([
            queryWithOrder,
            countQueryWithWhere
        ]);

        const data: EmailLogListItem[] = results.map(item => ({
            ...
            item,
            status: item.status as TypeEmailStatus,
            to_emails: Array.isArray(item.to_emails) ? item.to_emails : [String(item.to_emails)],
        }));

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
        return handleEmailLogError(error, 'list');
    }
}

/**
 * Single comprehensive details function
 */
export async function adminEmailLogDetails(id: string): Promise<ApiResponse<EmailLog>> {
    try {
        await requireAdmin();

        const log = await db.query.emailLogs.findFirst({ where: eq(emailLogs.id, id) });

        if (!log) {
            return { success: false, error: 'Email log not found', code: 'NOT_FOUND' };
        }

        return { success: true, data: log };
    } catch (error) {
        return handleEmailLogError(error, 'details');
    }
}

/**
 * Optimized CRUD operations with validation
 */
export async function adminEmailLogCreate(data: EmailLogCreateData): Promise<ApiResponse<EmailLog>> {
    try {
        await requireAdmin();

        const validation = validateEmailLogData(data);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        const [created] = await db.insert(emailLogs).values(data).returning();

        revalidatePath('/admin/email-logs');
        return { success: true, data: created };
    } catch (error: any) {
        return handleEmailLogError(error, 'create');
    }
}

export async function adminEmailLogUpdate(data: EmailLogUpdateData): Promise<ApiResponse<EmailLog>> {
    try {
        await requireAdmin();

        const validation = validateEmailLogData(data);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        const { id, ...updateData } = data;

        const [updated] = await db.update(emailLogs).set({ ...updateData, updated_at: sql`now()` }).where(eq(emailLogs.id, id)).returning();

        if (!updated) {
            return { success: false, error: 'Email log not found', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/email-logs');
        revalidatePath(`/admin/email-logs/${id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        return handleEmailLogError(error, 'update');
    }
}

export async function adminEmailLogDelete(id: string): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        const constraints = await checkEmailLogConstraints(id);
        if (!constraints.canDelete) {
            return { success: false, error: 'Cannot delete this email log due to business rules.', code: 'CONSTRAINT_VIOLATION' };
        }

        const [deleted] = await db.delete(emailLogs).where(eq(emailLogs.id, id)).returning();

        if (!deleted) {
            return { success: false, error: 'Email log not found', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/email-logs');
        return { success: true };
    } catch (error) {
        return handleEmailLogError(error, 'delete');
    }
}

/**
 * Business-specific operations
 */
export async function adminEmailLogCheckConstraints(id: string): Promise<ApiResponse<EmailLogConstraintCheck>> {
    try {
        await requireAdmin();
        const result = await checkEmailLogConstraints(id);
        return { success: true, data: result };
    } catch (error) {
        return handleEmailLogError(error, 'constraint-check');
    }
}

/**
 * Status update operation
 */
export async function adminEmailLogUpdateStatus(data: EmailLogStatusUpdate): Promise<ApiResponse<EmailLog>> {
    try {
        await requireAdmin();

        const currentLog = await db.query.emailLogs.findFirst({ where: eq(emailLogs.id, data.id), columns: { status: true } });

        if (!currentLog) {
            return { success: false, error: 'Email log not found', code: 'NOT_FOUND' };
        }

        if (!canUpdateEmailLogStatus(currentLog.status, data.status)) {
            return { success: false, error: `Cannot transition from ${currentLog.status} to ${data.status}`, code: 'INVALID_STATUS_TRANSITION' };
        }

        const [updated] = await db.update(emailLogs).set({ ...data, updated_at: sql`now()` }).where(eq(emailLogs.id, data.id)).returning();

        if (!updated) {
            return { success: false, error: 'Email log not found during update', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/email-logs');
        revalidatePath(`/admin/email-logs/${data.id}`);
        return { success: true, data: updated };
    } catch (error) {
        return handleEmailLogError(error, 'status-update');
    }
}