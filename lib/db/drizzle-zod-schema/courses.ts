import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { courses } from '@/lib/db/schema/courses';
import { z } from 'zod';
import { RawFiltersSchema, SingleFilterSchema } from '@/lib/types/shared';
import { ColumnFiltersState } from '@tanstack/react-table';

const MIN_DESCRIPTION_LENGTH = 1;
export const ZodCourseInsertSchema = createInsertSchema(courses, {
    title: schema => schema.min(3, 'Title must be at least 3 characters'),
    slug: schema =>
        schema
            .min(3, 'Slug must be at least 3 characters')
            .max(50, 'Slug cannot exceed 50 characters'),
    courseHighlights: schema =>
        schema
            .min(
                MIN_DESCRIPTION_LENGTH,
                `Course highlights needs to exceed more than ${MIN_DESCRIPTION_LENGTH} characters`
            )
            .optional(),
    courseOverview: schema =>
        schema
            .min(
                MIN_DESCRIPTION_LENGTH,
                `Course overview needs to exceed more than ${MIN_DESCRIPTION_LENGTH} characters`
            )
            .optional(),
    category_id: schema => schema.nonempty('Invalid category'),
    affiliation_id: schema => schema.optional(),
    level: schema => schema.int().min(1).max(5),
    duration_value: schema => schema.int().positive(),
    price: schema => schema.int().positive(),
    image_url: schema =>
        schema.url({ message: 'Invalid URL format' }).optional(),
});

export const ZodCourseSelectSchema = createSelectSchema(courses);
export const ZodAdminCourseQuerySchema = z
    .object({
        page: z.string().optional(),
        pageSize: z.string().optional(),
        sortBy: z.string().optional(),
        order: z.enum(['asc', 'desc']).optional(),
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
// Infer Typescript type for convenience.
export type ZodAdminCourseQueryType = z.infer<typeof ZodAdminCourseQuerySchema>;
export type ZodInsertCourseType = typeof ZodCourseInsertSchema._zod.input;
export type ZodSelectCourseType = typeof ZodCourseSelectSchema._zod.input;

// Extended type for courses with joined data
export type ZodSelectCourseWithRelationsType = ZodSelectCourseType & {
    category_name: string | null;
    affiliation_name: string | null;
};
