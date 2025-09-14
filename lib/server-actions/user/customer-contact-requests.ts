'use server';

import { db } from '@/lib/db/drizzle';
import { CustomerContactFormSchema } from '@/lib/db/drizzle-zod-schema/customer-contact-requests';
import { customerContactRequests } from '@/lib/db/schema/customer-contact-requests';
import { sendContactFormEmail } from '@/lib/email/resend';
import { logger } from '@/utils/logger';
import { z } from 'zod';

export async function createCustomerContactRequest(formData: FormData) {
    try {
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
        };

        const parsed = CustomerContactFormSchema.safeParse(data);

        if (!parsed.success) {
            return {
                success: false,
                error: z.treeifyError(parsed.error)
            };
        }

        // Save to database
        const result = await db
            .insert(customerContactRequests)
            .values(parsed.data)
            .returning();

        // Send email notification to admin using Resend
        try {
            const {error, success} = await sendContactFormEmail({
                name: parsed.data.name,
                email: parsed.data.email,
                phone: parsed.data.phone || undefined,
                message: parsed.data.message,
            });

            if (!success && error) {
                logger.error('Failed to send contact form email:', {description: error ?? 'unknown error'
            });
                // Don't fail the contact request if email fails, just log the error
            }
        } catch (emailError) {
            logger.error('Error sending contact form email:', {description: emailError});
            // Don't fail the contact request if email fails, just log the error
        }

        return {
            success: true,
            data: result[0],
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to submit contact request: ${errorMessage}`,
        };
    }
}
