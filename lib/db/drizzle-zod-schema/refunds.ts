import {createInsertSchema, createSelectSchema} from 'drizzle-zod';
import {refunds} from '../schema/refunds';
import {z} from 'zod';
import {RawFiltersSchema, SingleFilterSchema} from "@/lib/types/shared";

export const ZodRefundInsertSchema = createInsertSchema(refunds);

// Define the schema for admin refund query parameters
export const ZodAdminRefundQuerySchema = z.object({
    page: z.string().optional(), // Page number (default: '1')
    pageSize: z.string().optional(), // Items per page (default: '10')
    sortBy: z.string().optional(), // Field to sort by
    order: z.enum(['asc', 'desc']).optional(), // Sort order
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
// Export the TypeScript type for convenience
export const ZodRefundSelectSchema = createSelectSchema(refunds);
export type ZodInsertRefundType = typeof ZodRefundInsertSchema._zod.input;
export type ZodSelectRefundType = typeof ZodRefundSelectSchema._zod.input;

export type ZodAdminRefundQueryType = z.infer<typeof ZodAdminRefundQuerySchema>;