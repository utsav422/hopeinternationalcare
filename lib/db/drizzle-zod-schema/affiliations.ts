import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { affiliations } from '../schema/affiliations';
import { z } from "zod";
import { RawFiltersSchema, SingleFilterSchema } from "@/lib/types/shared";
import { ColumnFiltersState } from "@tanstack/react-table";

export const ZodAffiliationInsertSchema = createInsertSchema(
    affiliations,
    {
        name: (schema) =>
            schema.min(3, { message: 'Name must be at least 3 characters long' }),
        type: (schema) =>
            schema.min(1, { message: 'Type is required' }),
        description: (schema) =>
            schema
                .max(1000, { message: 'Description cannot exceed 1000 characters' })
                .optional(),
    }
);

export const ZodAffiliationSelectSchema =
    createSelectSchema(affiliations);

export const ZodAdminAffiliationQuerySchema = z.object({
    page: z.string().optional(), // Page number (default: '1')
    pageSize: z.string().optional(), // Items per page (default: '10')
    sortBy: z.string().optional(), // Field to sort by
    order: z.enum(['asc', 'desc']).optional(), // Sort order
    filters: RawFiltersSchema,
}).transform((data) => {
    let parsedColumnFilters: ColumnFiltersState = []; // Initialize as ColumnFilter array
    if (data.filters) {
        try {
            const potentialArray = JSON.parse(data.filters);
            if (Array.isArray(potentialArray)) {
                const validationResult = z.array(SingleFilterSchema).safeParse(potentialArray);
                if (validationResult.success) {
                    // Transform the validated array of objects into ColumnFilter[]
                    parsedColumnFilters = validationResult.data.flatMap(obj =>
                        Object.entries(obj).map(([key, value]) => ({
                            id: key, // Map object key to ColumnFilter.id
                            value: value ?? null // Map object value to ColumnFilter.value
                        }))
                    );
                } else {
                    console.warn("Invalid filter object structure in array:", validationResult.error.flatten());
                }
            } else {
                console.warn("Parsed filters is not an array:", potentialArray);
            }
        } catch (e) {
            console.warn("Failed to parse filters JSON string:", data.filters, e);
        }
    }

    return {
        ...data,
        filters: parsedColumnFilters, // Now it's ColumnFilter[]
        page: data.page ?? '1',
        pageSize: data.pageSize ?? '10',
        order: data.order ?? 'asc',
    };
});

// Infer Typescript type for convenience.
export type ZodInsertAffiliationType =
    typeof ZodAffiliationInsertSchema._zod.input;
export type ZodSelectAffiliationType =
    typeof ZodAffiliationSelectSchema._zod.input;
export type ZodAdminAffiliationQueryType = z.infer<typeof ZodAdminAffiliationQuerySchema>;