import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { customerContactRequests } from '@/lib/db/schema';
import { RawFiltersSchema, SingleFilterSchema } from '@/lib/types/shared';
import { ColumnFiltersState } from '@tanstack/react-table';

export const ZodCustomerContactRequestInsertSchema = createInsertSchema(
    customerContactRequests,
    {
        phone: schema =>
            schema
                .min(10, 'Phone number must be at least 10 digits')
                .optional(),
    }
);

export const ZodCustomerContactRequestSelectSchema = createSelectSchema(
    customerContactRequests
);

export const CustomerContactFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email address'),
    phone: z.string().optional(),
    message: z.string().min(1, 'Message is required'),
});

// Schema for contact request query parameters
export const ZodContactRequestQuerySchema = z
    .object({
        page: z.string().optional(),
        pageSize: z.string().optional(),
        sortBy: z.string().optional(), // Field to sort by
        order: z.enum(['asc', 'desc']).optional(), // Sort order
        filters: RawFiltersSchema,
    })
    .transform(data => {
        let parsedColumnFilters: ColumnFiltersState = []; // Initialize as ColumnFilter array
        if (data.filters) {
            try {
                const potentialArray = JSON.parse(data.filters);
                if (Array.isArray(potentialArray)) {
                    const validationResult = z
                        .array(SingleFilterSchema)
                        .safeParse(potentialArray);
                    if (validationResult.success) {
                        // Transform the validated array of objects into ColumnFilter[]
                        // Each object in the array might represent filters for multiple columns,
                        // or you might expect each object to have one key-value pair for one column filter.
                        // Let's assume each object can have multiple key-value pairs:
                        parsedColumnFilters = validationResult.data.flatMap(
                            obj =>
                                Object.entries(obj).map(([key, value]) => ({
                                    id: key, // Map object key to ColumnFilter.id
                                    value: value ?? null, // Map object value (string | undefined) to ColumnFilter.value (typically string | number | boolean | null | Array)
                                }))
                        );
                        // If you expect each object to represent a single column filter (e.g., { "columnName": "filterValue" }),
                        // and potentially multiple such objects, the above flatMap is appropriate.
                        // If an object could represent multiple filters for the *same* column (unlikely with this structure),
                        // or if the value needs special handling (e.g., turning comma-separated strings into arrays),
                        // you'd adjust the mapping logic inside flatMap accordingly.
                    } else {
                        console.warn(
                            'Invalid filter object structure in array:',
                            validationResult.error.flatten()
                        );
                    }
                } else {
                    console.warn(
                        'Parsed filters is not an array:',
                        potentialArray
                    );
                }
            } catch (e) {
                console.warn(
                    'Failed to parse filters JSON string:',
                    data.filters,
                    e
                );
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
export type ZodContactRequestQueryType = z.infer<
    typeof ZodContactRequestQuerySchema
>;

export type ZodCustomerContactRequestInsertType =
    typeof ZodCustomerContactRequestInsertSchema._zod.input;
export type ZodCustomerContactRequestSelectType =
    typeof ZodCustomerContactRequestSelectSchema._zod.input;
export type CustomerContactFormType = z.infer<typeof CustomerContactFormSchema>;
