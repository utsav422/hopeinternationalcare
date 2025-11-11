/**
 * Shared types for server actions to ensure consistency across the application
 */

// Type for Next.js searchParams (compatible with both URLSearchParams and Next.js searchParams)
export type NextJSSearchParams = Record<string, string | string[] | undefined>;
export type SearchParamsInput = URLSearchParams | NextJSSearchParams;

// Standard server action response types
export interface ServerActionResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any[];
}

export interface ServerActionError {
    success: false;
    message: string;
    errors?: any[];
}

export interface ServerActionSuccess<T = any> {
    success: true;
    message: string;
    data: T;
}

// Pagination response type
export interface PaginationResponse<T = any> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// Utility function to normalize search params to a plain object
export function normalizeSearchParams(
    searchParams: SearchParamsInput
): Record<string, any> {
    if (searchParams instanceof URLSearchParams) {
        return Object.fromEntries(searchParams.entries());
    } else {
        // Convert searchParams object to the format expected by Zod
        const rawParams: Record<string, any> = {};
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined) {
                // Handle array values by taking the first element
                rawParams[key] = Array.isArray(value) ? value[0] : value;
            }
        });
        return rawParams;
    }
}

// Helper function to create success response
export function createSuccessResponse<T>(
    message: string,
    data: T
): ServerActionSuccess<T> {
    return {
        success: true,
        message,
        data,
    };
}

// Helper function to create error response
export function createErrorResponse(
    message: string,
    errors?: any[]
): ServerActionError {
    return {
        success: false,
        message,
        errors,
    };
}

// Helper function to validate UUID
export function isValidUUID(uuid: string): boolean {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

// Helper function to sanitize string input
export function sanitizeString(
    input: string | undefined | null
): string | undefined {
    if (!input || typeof input !== 'string') return undefined;
    const trimmed = input.trim();
    return trimmed === '' ? undefined : trimmed;
}

// Helper function to parse date string
export function parseDate(dateString: string | undefined): Date | undefined {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
}

// Type guards for server action responses
export function isServerActionSuccess<T>(
    response: ServerActionResponse<T>
): response is ServerActionSuccess<T> {
    return response.success === true;
}

export function isServerActionError(
    response: ServerActionResponse
): response is ServerActionError {
    return response.success === false;
}
