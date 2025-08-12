'use server';

import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import { ZodCustomerContactRequestInsertSchema } from '@/lib/db/drizzle-zod-schema/customer-contact-requests';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { requireAdmin } from '@/utils/auth-guard';

export async function getCustomerContactRequests() {
  try {
    await requireAdmin();
    const requests = await db.query.customerContactRequests.findMany();
    return { success: true, data: requests };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to fetch contact requests: ${errorMessage}`,
    };
  }
}

export async function adminGetCustomerContactRequests({
  page = 1,
  pageSize = 10,
  search,
  status,
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  try {
    await requireAdmin();
    const offset = (page - 1) * pageSize;

    const requests = await db.query.customerContactRequests.findMany({
      limit: pageSize,
      offset,
      where: (customerContactRequests, { and, eq, ilike, or }) => {
        return and(
          search
            ? or(
                ilike(customerContactRequests.name, `%${search}%`),
                ilike(customerContactRequests.email, `%${search}%`)
              )
            : undefined,
          status ? eq(customerContactRequests.status, status) : undefined
        );
      },
      orderBy: (customerContactRequests, { desc }) => [
        desc(customerContactRequests.created_at),
      ],
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(customerContactRequests)
      .where(
        and(
          search
            ? or(
                ilike(customerContactRequests.name, `%${search}%`),
                ilike(customerContactRequests.email, `%${search}%`)
              )
            : undefined,
          status ? eq(customerContactRequests.status, status) : undefined
        )
      );

    return { success: true, data: requests, total: totalResult[0].count };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to fetch contact requests: ${errorMessage}`,
    };
  }
}

export async function updateCustomerContactRequestStatus(
  id: string,
  status: string
) {
  try {
    await requireAdmin();
    const parsed = ZodCustomerContactRequestInsertSchema.pick({
      status: true,
    }).safeParse({ status });
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }
    const data = await db
      .update(customerContactRequests)
      .set({ status: parsed.data.status })
      .where(eq(customerContactRequests.id, id))
      .returning();
    return {
      success: true,
      data: data[0],
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to update contact request status: ${errorMessage}`,
    };
  }
}

export async function deleteCustomerContactRequest(id: string) {
  try {
    await requireAdmin();
    const data = await db
      .delete(customerContactRequests)
      .where(eq(customerContactRequests.id, id))
      .returning();
    return { success: true, data: data[0] };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to delete contact request: ${errorMessage}`,
    };
  }
}

export const getCachedCustomerContactRequests = cache(
  getCustomerContactRequests
);
