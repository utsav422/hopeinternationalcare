import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { profiles } from '../schema/profiles';

export const ZodProfileInsertSchema = createInsertSchema(profiles);
export const ZodProfileSelectSchema = createSelectSchema(profiles);

// Soft delete specific schemas
export const ZodUserDeletionSchema = z.object({
    user_id: z.uuid('Invalid user ID format'),
    deletion_reason: z
        .string()
        .min(10, 'Deletion reason must be at least 10 characters')
        .max(500, 'Deletion reason cannot exceed 500 characters'),
    scheduled_deletion_date: z.iso.datetime().optional(),
    send_email_notification: z.boolean().optional().default(true),
});

export const ZodUserRestorationSchema = z.object({
    user_id: z.uuid('Invalid user ID format'),
    restoration_reason: z
        .string()
        .min(5, 'Restoration reason must be at least 5 characters')
        .max(300, 'Restoration reason cannot exceed 300 characters'),
});

export type ZodInsertProfileType = typeof ZodProfileInsertSchema._zod.input;
export type ZodSelectProfileType = typeof ZodProfileSelectSchema._zod.input;
export type ZodUserDeletionType = z.infer<typeof ZodUserDeletionSchema>;
export type ZodUserRestorationType = z.infer<typeof ZodUserRestorationSchema>;
