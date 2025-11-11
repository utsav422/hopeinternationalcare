'use server';

import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { sendContactFormEmail } from '@/lib/email/resend';
import { logger } from '@/lib/utils/logger';
import { CustomerContactRequestCreateData } from '@/lib/types/customer-contact-requests';
import { ApiResponse } from '@/lib/types';
import {
    CustomerContactRequestValidationError,
    validateCustomerContactRequestData,
} from '@/lib/utils/customer-contact-requests';

/**
 * Error handling utility
 */
export async function handleCustomerContactRequestError(
    error: unknown,
    operation: string
): Promise<ApiResponse<never>> {
    if (error instanceof CustomerContactRequestValidationError) {
        return Promise.reject({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
        });
    }

    if (error instanceof Error) {
        logger.error(`Customer Contact Request ${operation} failed:`, error);
        return Promise.reject({
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR',
        });
    }

    logger.error(
        `Unexpected error in customer contact request ${operation}:`,
        error as Record<string, any>
    );
    return Promise.reject({
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    });
}

/**
 * Create a new customer contact request from form data
 */
export async function createCustomerContactRequestFromFormData(
    formData: FormData
): Promise<ApiResponse<any>> {
    try {
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string | null,
            message: formData.get('message') as string,
        };

        // Validate data
        const validation = validateCustomerContactRequestData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details,
            };
        }
        // Call internal function with validated data
        return await createCustomerContactRequestInternal(data);
    } catch (error: unknown) {
        return handleCustomerContactRequestError(error, 'create');
    }
}

/**
 * Internal function to create a customer contact request with common logic
 */
async function createCustomerContactRequestInternal(
    data: CustomerContactRequestCreateData
): Promise<ApiResponse<any>> {
    // Save to database
    const result = await db
        .insert(customerContactRequests)
        .values(data)
        .returning();

    // Send email notification to admin using Resend
    try {
        const emailResult = await sendContactFormEmail({
            name: data.name,
            email: data.email,
            phone: data.phone || undefined,
            message: data.message,
        });

        if (!emailResult.success) {
            logger.error('Failed to send contact form email:', {
                description: emailResult.error ?? 'unknown error',
            });
            // Don't fail the contact request if email fails, just log the error
        } else {
            logger.info('Contact form email sent successfully:', {
                emailId: emailResult.data?.data?.id,
            });
        }
    } catch (emailError) {
        logger.error('Error sending contact form email:', {
            description: emailError,
        });
        // Don't fail the contact request if email fails, just log the error
    }

    return {
        success: true,
        data: result[0],
    };
}

/**
 * Create a new customer contact request from data object
 */
export async function createCustomerContactRequest(
    data: CustomerContactRequestCreateData
): Promise<ApiResponse<any>> {
    try {
        // Validate data
        const validation = validateCustomerContactRequestData(data);
        if (!validation.success) {
            return {
                success: false,
                error: validation.error || 'Validation failed',
                code: validation.code || 'VALIDATION_ERROR',
                details: validation.details,
            };
        }
        // Call internal function with validated data
        return await createCustomerContactRequestInternal(data);
    } catch (error: unknown) {
        return handleCustomerContactRequestError(error, 'create');
    }
}
