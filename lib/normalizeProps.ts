import {z} from "zod";

export async function normalizeProps<P extends z.ZodType<any, any>, SP extends z.ZodType<any, any>>(
    paramsSchema: P,
    searchParamsSchema: SP,
    params: unknown,
    searchParams: unknown
): Promise<{ params: z.infer<P>; searchParams: z.infer<SP> }> {
    // Validate params using the provided schema
    const validatedParams = await validateParams(paramsSchema, params);

    // Validate searchParams using the provided schema
    const validatedSearchParams = await validateSearchParams(searchParamsSchema, searchParams);

    return {
        params: validatedParams,
        searchParams: validatedSearchParams,
    };
}

// Helper function to validate params
async function validateParams<P extends z.ZodType<any, any>>(
    schema: P,
    params: unknown
): Promise<z.infer<P>> {
    const result = schema.safeParse(params);
    if (!result.success) {
        throw new Error("Invalid params");
    }
    return result.data;
}

// Helper function to validate searchParams
async function validateSearchParams<SP extends z.ZodType<any, any>>(
    schema: SP,
    searchParams: unknown
): Promise<z.infer<SP>> {
    const result = schema.safeParse(searchParams);
    if (!result.success) {
        throw new Error("Invalid searchParams");
    }

    // Apply default values for optional fields in searchParams
    const defaultSearchParams = {
        page: 1,
        pageSize: 10,
        order: "asc",
        ...result.data,
    };

    return defaultSearchParams as z.infer<SP>;
}