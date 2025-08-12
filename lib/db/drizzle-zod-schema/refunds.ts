import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { refunds } from '../schema/refunds';
export const ZodRefundInsertSchema = createInsertSchema(refunds);

export const ZodRefundSelectSchema = createSelectSchema(refunds);
export type ZodInsertRefundType = typeof ZodRefundInsertSchema._zod.input;
export type ZodSelectRefundType = typeof ZodRefundSelectSchema._zod.input;
