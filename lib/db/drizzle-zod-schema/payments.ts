import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { TypeEnrollmentStatus, TypePaymentStatus } from '../schema/enums';
import { payments } from '@/lib/db/schema';
import { z } from 'zod';
import { RawFiltersSchema, SingleFilterSchema } from '@/lib/types/shared';
import { ColumnFiltersState } from '@tanstack/react-table';

export const ZodPaymentInsertSchema = createInsertSchema(payments);

// Define the schema for admin intake query parameters
export const ZodAdminPaymentQuerySchema = z
    .object({
        page: z.string().optional(), // Page number (default: '1')
        pageSize: z.string().optional(), // Items per page (default: '10')
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
// Export the TypeScript type for convenience
export const ZodPaymentSelectSchema = createSelectSchema(payments);
export type ZodInsertPaymentType = typeof ZodPaymentInsertSchema._zod.input;
export type ZodSelectPaymentType = typeof ZodPaymentSelectSchema._zod.input;
export type ZodAdminPaymentQueryType = z.infer<
    typeof ZodAdminPaymentQuerySchema
>;
export type PaymentDetailsType = {
    id: string;
    amount: number;
    status: TypePaymentStatus;
    paid_at: string | null;
    method: string | null;
    remarks: string | null;
    is_refunded: boolean | null;

    enrollment_id: string | null;
    enrolled_at: string | null;
    enrollment_status: TypeEnrollmentStatus | null;

    user_id: string | null;
    userEmail: string | null;
    userName: string | null;

    courseId: string | null;
    courseTitle: string | null;
};
