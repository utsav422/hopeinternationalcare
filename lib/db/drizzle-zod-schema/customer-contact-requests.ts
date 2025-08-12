import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { customerContactRequests } from '../schema/customer-contact-requests';

export const ZodCustomerContactRequestInsertSchema = createInsertSchema(
  customerContactRequests,
  {
    phone: (schema) =>
      schema.min(10, 'Phone number must be at least 10 digits').optional(),
  }
);
export type ZodCustomerContactRequestInsertType =
  typeof ZodCustomerContactRequestInsertSchema._zod.input;

export const ZodCustomerContactRequestSelectSchema = createSelectSchema(
  customerContactRequests
);
export type ZodCustomerContactRequestSelectType =
  typeof ZodCustomerContactRequestSelectSchema._zod.input;

export const CustomerContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});
export type CustomerContactFormType = z.infer<typeof CustomerContactFormSchema>;
