import { type ApiResponse } from '@/lib/types';
import { logger } from '@/utils/logger';

/**
 * Standardized error response handler for enrollment operations
 */
export function handleEnrollmentError(
    error: unknown,
    operation: string
): ApiResponse<never> {
    // Log the error for debugging
    logger.error(`Enrollment ${operation} failed:`, { error });

    // Handle specific error types
    if (error instanceof Error) {
        // Handle enrollment-specific validation errors
        if (error.name === 'EnrollmentValidationError') {
            return {
                success: false,
                error: error.message,
                code: 'VALIDATION_ERROR',
                details:
                    'details' in error ? (error as any).details : undefined,
            };
        }

        // Handle enrollment-specific business errors
        if (error.name === 'EnrollmentBusinessError') {
            return {
                success: false,
                error: error.message,
                code: 'BUSINESS_ERROR',
                details:
                    'details' in error ? (error as any).details : undefined,
            };
        }

        // Handle database errors
        if (
            error.message.includes('database') ||
            error.message.includes('SQL')
        ) {
            return {
                success: false,
                error: 'Database operation failed',
                code: 'DATABASE_ERROR',
            };
        }

        // Handle validation errors from Zod or similar libraries
        if (
            error.message.includes('validation') ||
            error.message.includes('Validation')
        ) {
            return {
                success: false,
                error: 'Validation failed',
                code: 'VALIDATION_ERROR',
            };
        }

        // Handle authorization errors
        if (
            error.message.includes('authorization') ||
            error.message.includes('permission')
        ) {
            return {
                success: false,
                error: 'Insufficient permissions',
                code: 'AUTHORIZATION_ERROR',
            };
        }
    }

    // Handle string errors
    if (typeof error === 'string') {
        return {
            success: false,
            error,
            code: 'UNKNOWN_ERROR',
        };
    }

    // Default error response
    return {
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    };
}

/**
 * Standardized success response handler
 */
export function handleEnrollmentSuccess<T>(
    data: T,
    message?: string
): ApiResponse<T> {
    return {
        success: true,
        data,
        ...(message && { message }),
    };
}

/**
 * Standardized validation error handler
 */
export function handleValidationError(
    errors: string[] | Record<string, string>
): ApiResponse<never> {
    return {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Array.isArray(errors) ? { errors } : errors,
    };
}
