import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { intakes } from '../schema/intakes';
export const ZodIntakeInsertSchema = createInsertSchema(intakes);

export const ZodIntakeSelectSchema = createSelectSchema(intakes);

// Infer Typescript type for convenience.
export type ZodInsertIntakeType = typeof ZodIntakeInsertSchema._zod.input;
export type ZodSelectIntakeType = typeof ZodIntakeSelectSchema._zod.input;
