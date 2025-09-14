import {createInsertSchema, createSelectSchema} from 'drizzle-zod';
import {z} from 'zod';
import {userDeletionHistory} from '../schema/user-deletion-history';
import {RawFiltersSchema, SingleFilterSchema} from "@/lib/types/shared";

export const ZodUserDeletionHistoryInsertSchema = createInsertSchema(userDeletionHistory);
export const ZodUserDeletionHistorySelectSchema = createSelectSchema(userDeletionHistory);

// Query schemas for filtering and pagination
export const ZodDeletedUsersQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.enum(['deleted_at', 'full_name', 'email', 'deletion_count']).default('deleted_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
    filters: RawFiltersSchema,
}).transform((data) => {
    // Transformation step to parse the filter string
    let parsedFilters: z.infer<typeof SingleFilterSchema>[] = [];
    if (data.filters) {
        try {
            const potentialArray = JSON.parse(data.filters);
            // Ensure it's an array after parsing
            if (Array.isArray(potentialArray)) {
                // Validate each item in the array conforms to SingleFilterSchema
                const validationResult = z.array(SingleFilterSchema).safeParse(potentialArray);
                if (validationResult.success) {
                    parsedFilters = validationResult.data;
                } else {
                    console.warn("Invalid filter object structure in array:", validationResult.error.flatten());
                    // Optionally, you could throw an error here instead of defaulting to empty
                }
            } else {
                console.warn("Parsed filters is not an array:", potentialArray);
                // If it's a single object, you might want to wrap it in an array
                // Or treat it as invalid. Let's assume invalid for now.
            }
        } catch (e) {
            console.warn("Failed to parse filters JSON string:", data.filters, e);
            // If parsing fails, filters remain an empty array
        }
    }

    // Return the data with the parsed filters array
    return {
        ...data,
        filters: parsedFilters, // Now it's an array of filter objects or empty
        // Apply other defaults if needed directly here or in normalizeProps
        page: data.page ?? '1',
        pageSize: data.pageSize ?? '10',
        order: data.order ?? 'asc',
    };
});

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
