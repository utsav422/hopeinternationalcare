import {createInsertSchema, createSelectSchema} from 'drizzle-zod';
import {intakes} from '@/lib/db/schema';
import {z} from "zod";
import {RawFiltersSchema, SingleFilterSchema} from "@/lib/types/shared";

export const ZodIntakeInsertSchema = createInsertSchema(intakes);

export const ZodIntakeSelectSchema = createSelectSchema(intakes);
export const ZodAdminIntakeQuerySchema = z.object({
    page: z.string().optional(), // Page number (default: '1')
    pageSize: z.string().optional(), // Items per page (default: '10')
    sortBy: z.string().optional(), // Field to sort by (default: 'created_at')
    order: z.enum(['asc', 'desc']).optional(), // Sort order (default: 'desc')
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
                    console.warn("Invalid filter object structure in array:", z.treeifyError(validationResult.error));
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
// Infer Typescript type for convenience.
export type ZodInsertIntakeType = typeof ZodIntakeInsertSchema._zod.input;
export type ZodSelectIntakeType = typeof ZodIntakeSelectSchema._zod.input;
export type ZodAdminIntakeQueryType = z.infer<typeof ZodAdminIntakeQuerySchema>;