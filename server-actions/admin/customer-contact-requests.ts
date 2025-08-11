'use server';

import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { requireAdmin } from '@/utils/auth-guard';
import { db } from '@/utils/db/drizzle';
import { ZodCustomerContactRequestInsertSchema } from '@/utils/db/drizzle-zod-schema/customer-contact-requests';
import { customerContactRequests } from '@/utils/db/schema/customer-contact-requests';

export async function getCustomerContactRequests() {
  await requireAdmin();
  try {
    const requests = await db.query.customerContactRequests.findMany();
    return { data: requests };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to fetch contact requests: ${errorMessage}` };
  }
}

export async function updateCustomerContactRequestStatus(
  id: string,
  status: string
) {
  await requireAdmin();
  try {
    const parsed = ZodCustomerContactRequestInsertSchema.pick({
      status: true,
    }).safeParse({ status });
    if (!parsed.success) {
      return { error: parsed.error.message };
    }
    await db
      .update(customerContactRequests)
      .set({ status: parsed.data.status })
      .where(eq(customerContactRequests.id, id));
    return {
      success: true,
      message: 'Contact request status updated successfully!',
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      error: `Failed to update contact request status: ${errorMessage}`,
    };
  }
}

export async function deleteCustomerContactRequest(id: string) {
  await requireAdmin();
  try {
    await db
      .delete(customerContactRequests)
      .where(eq(customerContactRequests.id, id));
    return { success: true, message: 'Contact request deleted successfully!' };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to delete contact request: ${errorMessage}` };
  }
}

export const getCachedCustomerContactRequests = cache(
  getCustomerContactRequests
);
