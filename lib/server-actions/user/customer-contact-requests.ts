'use server';

import { db } from '@/lib/db/drizzle';
import { CustomerContactFormSchema } from '@/lib/db/drizzle-zod-schema/customer-contact-requests';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';

export async function createCustomerContactRequest(formData: FormData) {
  try {
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      message: formData.get('message'),
    };

    const parsed = CustomerContactFormSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(', '),
      };
    }

    const result = await db
      .insert(customerContactRequests)
      .values(parsed.data)
      .returning();
    return {
      success: true,
      data: result[0],
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Failed to submit contact request: ${errorMessage}`,
    };
  }
}
