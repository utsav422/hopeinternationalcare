import { z } from 'zod';
// Shared types for animation components
export type RoutePoint = {
    x: number;
    y: number;
    delay?: number;
};

export type DOT = {
    x: number;
    y: number;
    radius?: number;
    opacity?: number;
    id?: string;
};

export const SingleFilterSchema = z.object({
    id: z.string(),
    value: z.string(), // Adjust if value can be undefined/null
});

export const RawFiltersSchema = z.string().optional();

// Schema for params when it contains 'id'
export const IdParamsSchema = z.object({
    id: z.string().optional(),
});

// Schema for params when it contains 'slug'
export const SlugParamsSchema = z.object({
    slug: z.string().optional(),
});

// Default schema for params (empty object if no schema is provided)
export const DefaultParamsSchema = z.object({});

// Default schema for searchParams
export const DefaultSearchParamsSchema = z
    .object({
        page: z.string().optional(), // Page number (default: '1')
        pageSize: z.string().optional(), // Items per page (default: '10')
        sortBy: z.string().optional(), // Field to sort by
        order: z.enum(['asc', 'desc']).optional(), // Sort order
        filters: RawFiltersSchema,
    })
    .transform(data => {
        // Transformation step to parse the filter string
        let parsedFilters: z.infer<typeof SingleFilterSchema>[] = [];
        if (data.filters) {
            try {
                const potentialArray = JSON.parse(data.filters);
                // Ensure it's an array after parsing
                if (Array.isArray(potentialArray)) {
                    // Validate each item in the array conforms to SingleFilterSchema
                    const validationResult = z
                        .array(SingleFilterSchema)
                        .safeParse(potentialArray);
                    if (validationResult.success) {
                        parsedFilters = validationResult.data;
                    } else {
                        console.warn(
                            'Invalid filter object structure in array:',
                            validationResult.error.flatten()
                        );
                        // Optionally, you could throw an error here instead of defaulting to empty
                    }
                } else {
                    console.warn(
                        'Parsed filters is not an array:',
                        potentialArray
                    );
                    // If it's a single object, you might want to wrap it in an array
                    // Or treat it as invalid. Let's assume invalid for now.
                }
            } catch (e) {
                console.warn(
                    'Failed to parse filters JSON string:',
                    data.filters,
                    e
                );
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

export type IdParams = z.infer<typeof IdParamsSchema>;
export type SlugParams = z.infer<typeof SlugParamsSchema>;
export type DefaultSearchParams = z.infer<typeof DefaultSearchParamsSchema>;
// API response type
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    details?: Record<string, any>;
}
