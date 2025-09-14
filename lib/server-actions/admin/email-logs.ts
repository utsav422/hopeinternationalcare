'use server';

import { cache } from 'react';
import { desc, eq, ilike, and, sql, count } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { emailLogs } from '@/lib/db/schema/email-logs';
import { requireAdmin } from '@/utils/auth-guard';
import { logger } from '@/utils/logger';
import { 
  CreateEmailLogSchema, 
  UpdateEmailLogStatusSchema,
  type CreateEmailLogType,
  type UpdateEmailLogStatusType 
} from '@/lib/db/drizzle-zod-schema/email-logs';

// Create email log entry
export async function createEmailLog(data: CreateEmailLogType) {
  try {
    // Validate input
    const parsed = CreateEmailLogSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map(e => e.message).join(', '),
      };
    }

    // Insert email log
    const result = await db
      .insert(emailLogs)
      .values({
        ...parsed.data,
        sent_at: new Date().toISOString(),
      })
      .returning();

    logger.info('Email log created:', {
      emailLogId: result[0].id,
      emailType: parsed.data.email_type,
      recipients: parsed.data.to_emails.length,
    });

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to create email log:', {
      error: errorMessage,
      emailType: data.email_type,
    });
    return {
      success: false,
      error: `Failed to create email log: ${errorMessage}`,
    };
  }
}

// Get email logs with pagination and filtering
export async function adminEmailLogsList({
  page = 1,
  pageSize = 10,
  search,
  status,
  emailType,
  dateFrom,
  dateTo,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  emailType?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  try {
    await requireAdmin();
    
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const whereConditions = [];
    
    if (search) {
      whereConditions.push(
        sql`(${emailLogs.subject} ILIKE ${`%${search}%`} OR 
            ${emailLogs.from_email} ILIKE ${`%${search}%`} OR
            ${emailLogs.to_emails}::text ILIKE ${`%${search}%`})`
      );
    }
    
    if (status) {
      whereConditions.push(eq(emailLogs.status, status));
    }
    
    if (emailType) {
      whereConditions.push(eq(emailLogs.email_type, emailType));
    }
    
    if (dateFrom) {
      whereConditions.push(sql`${emailLogs.sent_at} >= ${dateFrom}`);
    }
    
    if (dateTo) {
      whereConditions.push(sql`${emailLogs.sent_at} <= ${dateTo}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(emailLogs)
      .where(whereClause);
    
    const total = totalResult[0]?.count || 0;

    // Get paginated results
    const logs = await db
      .select()
      .from(emailLogs)
      .where(whereClause)
      .orderBy(desc(emailLogs.sent_at))
      .limit(pageSize)
      .offset(offset);

    return {
      success: true,
      data: logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch email logs:', {
      error: errorMessage,
      page,
      pageSize,
    });
    return {
      success: false,
      error: `Failed to fetch email logs: ${errorMessage}`,
    };
  }
}

// Get email log by ID
export async function adminEmailLogById(id: string) {
  try {
    await requireAdmin();

    const log = await db.query.emailLogs.findFirst({
      where: eq(emailLogs.id, id),
    });

    if (!log) {
      return {
        success: false,
        error: 'Email log not found',
      };
    }

    return {
      success: true,
      data: log,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch email log:', {
      error: errorMessage,
      emailLogId: id,
    });
    return {
      success: false,
      error: `Failed to fetch email log: ${errorMessage}`,
    };
  }
}

// Update email log status
export async function updateEmailLogStatus(data: UpdateEmailLogStatusType) {
  try {
    // Validate input
    const parsed = UpdateEmailLogStatusSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map(e => e.message).join(', '),
      };
    }

    const { id, status, delivered_at, opened_at, clicked_at, error_message } = parsed.data;

    // Update email log
    const result = await db
      .update(emailLogs)
      .set({
        status,
        delivered_at,
        opened_at,
        clicked_at,
        error_message,
        updated_at: new Date().toISOString(),
      })
      .where(eq(emailLogs.id, id))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: 'Email log not found',
      };
    }

    logger.info('Email log status updated:', {
      emailLogId: id,
      newStatus: status,
    });

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to update email log status:', {
      error: errorMessage,
      emailLogId: data.id,
    });
    return {
      success: false,
      error: `Failed to update email log status: ${errorMessage}`,
    };
  }
}

// Delete email log
export async function adminEmailLogDeleteById(id: string) {
  try {
    await requireAdmin();

    const result = await db
      .delete(emailLogs)
      .where(eq(emailLogs.id, id))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        error: 'Email log not found',
      };
    }

    logger.info('Email log deleted:', {
      emailLogId: id,
    });

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to delete email log:', {
      error: errorMessage,
      emailLogId: id,
    });
    return {
      success: false,
      error: `Failed to delete email log: ${errorMessage}`,
    };
  }
}

// Get email statistics
export async function adminEmailLogsStats() {
  try {
    await requireAdmin();

    const stats = await db
      .select({
        status: emailLogs.status,
        count: count(),
      })
      .from(emailLogs)
      .groupBy(emailLogs.status);

    const totalEmails = await db
      .select({ count: count() })
      .from(emailLogs);

    const recentEmails = await db
      .select({ count: count() })
      .from(emailLogs)
      .where(sql`${emailLogs.sent_at} >= NOW() - INTERVAL '24 hours'`);

    return {
      success: true,
      data: {
        statusBreakdown: stats,
        totalEmails: totalEmails[0]?.count || 0,
        recentEmails: recentEmails[0]?.count || 0,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch email stats:', {
      error: errorMessage,
    });
    return {
      success: false,
      error: `Failed to fetch email stats: ${errorMessage}`,
    };
  }
}

// Cached versions
export const cachedAdminEmailLogsList = cache(adminEmailLogsList);
export const cachedAdminEmailLogById = cache(adminEmailLogById);
export const cachedAdminEmailLogsStats = cache(adminEmailLogsStats);
