import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { userDeletionHistory } from '../schema/user-deletion-history';

export const ZodUserDeletionHistoryInsertSchema = createInsertSchema(userDeletionHistory);
export const ZodUserDeletionHistorySelectSchema = createSelectSchema(userDeletionHistory);

// Query schemas for filtering and pagination
export const ZodDeletedUsersQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.enum(['deleted_at', 'full_name', 'email', 'deletion_count']).default('deleted_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional().or(z.literal('')),
    deleted_by: z.uuid('Invalid admin ID format').optional().or(z.literal('')),
    date_from: z.iso.datetime().optional().or(z.literal('')),
    date_to: z.iso.datetime().optional().or(z.literal('')),
}).transform((data) => ({
    ...data,
    // Convert empty strings to undefined for cleaner handling
    search: data.search === '' ? undefined : data.search,
    deleted_by: data.deleted_by === '' ? undefined : data.deleted_by,
    date_from: data.date_from === '' ? undefined : data.date_from,
    date_to: data.date_to === '' ? undefined : data.date_to,
}));

export const ZodUserDeletionHistoryQuerySchema = z.object({
    user_id: z.uuid('Invalid user ID format'),
});

export const ZodCancelScheduledDeletionSchema = z.object({
    user_id: z.uuid('Invalid user ID format'),
});

export type ZodInsertUserDeletionHistoryType = typeof ZodUserDeletionHistoryInsertSchema._zod.input;
export type ZodSelectUserDeletionHistoryType = typeof ZodUserDeletionHistorySelectSchema._zod.input;
export type ZodDeletedUsersQueryType = z.infer<typeof ZodDeletedUsersQuerySchema>;
export type ZodDeletedUsersSortByQueryType = Pick<ZodDeletedUsersQueryType, 'sortBy'>;
export type ZodUserDeletionHistoryQueryType = z.infer<typeof ZodUserDeletionHistoryQuerySchema>;
export type ZodCancelScheduledDeletionType = z.infer<typeof ZodCancelScheduledDeletionSchema>;
