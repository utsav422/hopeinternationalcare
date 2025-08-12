import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { profiles } from '../schema/profiles';
export const ZodProfileInsertSchema = createInsertSchema(profiles);
export const ZodProfileSelectSchema = createSelectSchema(profiles);
export type ZodInsertProfileType = typeof ZodProfileInsertSchema._zod.input;
export type ZodSelectProfileType = typeof ZodProfileSelectSchema._zod.input;

// id: string;
// full_name: string;
// email: string;
// phone: string | null;
// role: string | null;
// created_at: string;
