'use server';

import { db } from '@/utils/db/drizzle';
import { customerContactRequests } from '@/utils/db/schema/customer-contact-requests';
import { CustomerContactFormSchema } from '@/utils/db/drizzle-zod-schema/customer-contact-requests';

export async function createCustomerContactRequest(formData: FormData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
  };

  const parsed = CustomerContactFormSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.errors.map(e => e.message).join(', ') };
  }

  try {
    await db.insert(customerContactRequests).values(parsed.data);
    return { success: true, message: 'Your contact request has been submitted successfully!' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to submit contact request: ${errorMessage}` };
  }
}
