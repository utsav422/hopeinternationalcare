'use server';

import { eq, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { customerContactReplies, CustomerContactReply } from '@/lib/db/schema/customer-contact-replies';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/lib/utils/logger';
import {
    CustomerContactReplyListItem,
    CustomerContactReplyWithDetails,
    CustomerContactReplyQueryParams,
    CustomerContactReplyCreateData,
    CustomerContactReplyUpdateData,
    CustomerContactReplyConstraintCheck,
    CustomerContactReplyStatusUpdate,
    TypeCustomerContactReplyEmailStatus
} from '@/lib/types/customer-contact-replies';
import { ApiResponse } from '@/lib/types';
import {
    validateCustomerContactReplyData,
    checkCustomerContactReplyConstraints,
    CustomerContactReplyValidationError
} from '@/lib/utils/customer-contact-replies';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import { sendEmail } from '@/lib/email/resend';

// Column mappings for customer contact replies
const customerContactReplyColumnMap = {
    id: customerContactReplies.id,
    subject: customerContactReplies.subject,
    message: customerContactReplies.message,
    email_status: customerContactReplies.email_status,
    created_at: customerContactReplies.created_at,
    updated_at: customerContactReplies.updated_at,
    request_name: customerContactRequests.name,
    request_email: customerContactRequests.email,
};

/**
 * Error handling utility
 */
export function handleCustomerContactReplyError(error: unknown, operation: string): ApiResponse<never> {
    if (error instanceof CustomerContactReplyValidationError) {
        return { success: false, error: error.message, code: error.code, details: error.details };
    }

    if (error instanceof Error) {
        logger.error(`Customer Contact Reply ${operation} failed:`, { error: error.message });
        return { success: false, error: error.message, code: 'UNKNOWN_ERROR' };
    }

    logger.error(`Unexpected error in customer contact reply ${operation}:`, { error: String(error) });
    return { success: false, error: 'An unexpected error occurred', code: 'UNKNOWN_ERROR' };
}

/**
 * Single comprehensive list function with filtering and pagination
 */
export async function adminCustomerContactReplyList(params: CustomerContactReplyQueryParams): Promise<ApiResponse<{
    data: CustomerContactReplyListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    try {
        await requireAdmin();

        const { page = 1, pageSize = 10, sortBy = 'created_at', order = 'desc', filters = [], search } = params;
        const offset = (page - 1) * pageSize;

        const filterConditions = buildFilterConditions(filters, customerContactReplyColumnMap);

        if (search) {
            const searchFilter = `%${search}%`;
            filterConditions.push(
                sql`(${customerContactReplies.subject} ILIKE ${searchFilter} OR ${customerContactReplies.message} ILIKE ${searchFilter} OR ${customerContactRequests.name} ILIKE ${searchFilter} OR ${customerContactRequests.email} ILIKE ${searchFilter})`
            );
        }

        const whereClause = buildWhereClause(filterConditions);
        const orderBy = buildOrderByClause(sortBy, order, customerContactReplyColumnMap);

        const query = db
            .select({
                id: customerContactReplies.id,
                subject: customerContactReplies.subject,
                message: customerContactReplies.message,
                email_status: customerContactReplies.email_status,
                created_at: customerContactReplies.created_at,
                updated_at: customerContactReplies.updated_at,
                request: {
                    id: customerContactRequests.id,
                    name: customerContactRequests.name,
                    email: customerContactRequests.email,
                },
            })
            .from(customerContactReplies)
            .leftJoin(customerContactRequests, eq(customerContactReplies.contact_request_id, customerContactRequests.id))
            .limit(pageSize)
            .offset(offset);

        const queryWithWhere = whereClause ? query.where(whereClause) : query;
        const queryWithOrder = orderBy ? queryWithWhere.orderBy(orderBy) : queryWithWhere;

        const countQuery = db.select({ count: sql<number>`count(*)` }).from(customerContactReplies).leftJoin(customerContactRequests, eq(customerContactReplies.contact_request_id, customerContactRequests.id)).where(whereClause);

        const [results, countResult] = await Promise.all([
            queryWithOrder,
            countQuery
        ]);

        const data: CustomerContactReplyListItem[] = results.map(item => ({
            ...item,
            email_status: item.email_status as TypeCustomerContactReplyEmailStatus,
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
        return handleCustomerContactReplyError(error, 'list');
    }
}

/**
 * Single comprehensive details function with proper joins
 */
export async function adminCustomerContactReplyDetails(id: string): Promise<ApiResponse<CustomerContactReplyWithDetails>> {
    try {
        await requireAdmin();

        const reply = await db.query.customerContactReplies.findFirst({
            where: eq(customerContactReplies.id, id),
            with: {
                request: true
            }
        });

        if (!reply) {
            return { success: false, error: 'Customer contact reply not found', code: 'NOT_FOUND' };
        }

        const { request, ...replyData } = reply;

        return {
            success: true,
            data: {
                reply: replyData,
                request: request || null
            }
        };
    } catch (error) {
        return handleCustomerContactReplyError(error, 'details');
    }
}

/**
 * Creates a reply and sends it as an email.
 */
export async function adminCustomerContactReplyCreate(data: CustomerContactReplyCreateData): Promise<ApiResponse<CustomerContactReply>> {
    try {
        const adminSession = await requireAdmin();
        if (!adminSession) {
            return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' };
        }

        const validation = validateCustomerContactReplyData(data);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        const [createdReply] = await db.insert(customerContactReplies).values({
            ...data,
            admin_id: adminSession.user.id,
            admin_email: adminSession.user.email,
            email_status: 'sending',
        }).returning();

        try {
            const emailResult = await sendEmail({
                to: data.reply_to_email,
                subject: data.subject,
                html: data.message,
            });

            const finalStatus: TypeCustomerContactReplyEmailStatus = emailResult.success ? 'sent' : 'failed';
            const [updatedReply] = await db.update(customerContactReplies).set({
                email_status: finalStatus,
                resend_email_id: emailResult.data?.id,
                error_message: emailResult.error,
            }).where(eq(customerContactReplies.id, createdReply.id)).returning();

            revalidatePath('/admin/customer-contact-replies');
            return { success: true, data: updatedReply };

        } catch (emailError) {
            logger.error('Failed to send reply email after creation:', { error: emailError, replyId: createdReply.id });
            const [updatedReply] = await db.update(customerContactReplies).set({
                email_status: 'failed',
                error_message: emailError instanceof Error ? emailError.message : 'Unknown email error',
            }).where(eq(customerContactReplies.id, createdReply.id)).returning();
            // We don't rethrow, as the reply was created. The failure is in the email sending part.
            return { success: true, data: updatedReply };
        }

    } catch (error: any) {
        return handleCustomerContactReplyError(error, 'create');
    }
}


export async function adminCustomerContactReplyUpdate(data: CustomerContactReplyUpdateData): Promise<ApiResponse<CustomerContactReply>> {
    try {
        await requireAdmin();

        const validation = validateCustomerContactReplyData(data);
        if (!validation.success) {
            return { success: false, error: validation.error || 'Validation failed', code: validation.code || 'VALIDATION_ERROR', details: validation.details };
        }

        const { id, ...updateData } = data;

        const [updated] = await db.update(customerContactReplies).set({ ...updateData, updated_at: sql`now()` }).where(eq(customerContactReplies.id, id)).returning();

        if (!updated) {
            return { success: false, error: 'Customer contact reply not found', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/customer-contact-replies');
        revalidatePath(`/admin/customer-contact-replies/${id}`);
        return { success: true, data: updated };
    } catch (error: any) {
        return handleCustomerContactReplyError(error, 'update');
    }
}

export async function adminCustomerContactReplyDelete(id: string): Promise<ApiResponse<void>> {
    try {
        await requireAdmin();

        const constraints = await checkCustomerContactReplyConstraints(id);
        if (!constraints.canDelete) {
            return { success: false, error: 'Cannot delete this customer contact reply due to business rules.', code: 'CONSTRAINT_VIOLATION' };
        }

        const [deleted] = await db.delete(customerContactReplies).where(eq(customerContactReplies.id, id)).returning();

        if (!deleted) {
            return { success: false, error: 'Customer contact reply not found', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/customer-contact-replies');
        return { success: true };
    } catch (error) {
        return handleCustomerContactReplyError(error, 'delete');
    }
}

/**
 * Business-specific operations
 */
export async function adminCustomerContactReplyCheckConstraints(id: string): Promise<ApiResponse<CustomerContactReplyConstraintCheck>> {
    try {
        await requireAdmin();
        const result = await checkCustomerContactReplyConstraints(id);
        return { success: true, data: result };
    } catch (error) {
        return handleCustomerContactReplyError(error, 'constraint-check');
    }
}

/**
 * Status update operation, likely for webhooks.
 */
export async function adminCustomerContactReplyUpdateStatus(data: CustomerContactReplyStatusUpdate): Promise<ApiResponse<CustomerContactReply>> {
    try {
        await requireAdmin();

        const { id, ...updateData } = data;

        const [updated] = await db.update(customerContactReplies).set({ ...updateData, updated_at: sql`now()` }).where(eq(customerContactReplies.id, id)).returning();

        if (!updated) {
            return { success: false, error: 'Customer contact reply not found', code: 'NOT_FOUND' };
        }

        revalidatePath('/admin/customer-contact-replies');
        revalidatePath(`/admin/customer-contact-replies/${id}`);
        return { success: true, data: updated };
    } catch (error) {
        return handleCustomerContactReplyError(error, 'status-update');
    }
}