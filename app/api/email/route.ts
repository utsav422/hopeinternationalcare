import { NextResponse } from 'next/server';
import { sendContactFormEmail, isResendConfigured } from '@/lib/email/resend';
import { withApiSecurity, getSanitizedBody, type AuthenticatedRequest } from '@/lib/api-security/middleware';
import { validateContactForm, detectSpamInput } from '@/lib/api-security/input-sanitizer';
import { actionRateLimit, RATE_LIMITS } from '@/lib/api-security/rate-limiter';

async function handleContactForm(request: AuthenticatedRequest) {
    try {
        // Check if Resend is properly configured
        if (!isResendConfigured()) {
            return NextResponse.json(
                { error: 'Email service is not configured' },
                { status: 500 }
            );
        }

        // Get sanitized body from middleware
        const body = getSanitizedBody(request);

        // Validate contact form data
        const validation = validateContactForm(body);
        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validation.errors
                },
                { status: 400 }
            );
        }

        const { name, email, phone, message } = validation.sanitized!;

        // Check for spam (repeated identical messages)
        const clientId = request.headers.get('x-forwarded-for') ||
                         request.headers.get('x-real-ip') ||
                         request.headers.get('cf-connecting-ip') ||
                         'unknown';
        if (detectSpamInput(message, clientId)) {
            return NextResponse.json(
                { error: 'Spam detected. Please wait before submitting again.' },
                { status: 429 }
            );
        }

        // Additional rate limiting for contact form submissions
        const rateLimitResult = await actionRateLimit(request, 'contact_form', 3, 300); // 3 attempts per 5 minutes
        if (!rateLimitResult.success) {
            return NextResponse.json(
                {
                    error: 'Too many contact form submissions. Please try again later.',
                    retryAfter: rateLimitResult.retryAfter
                },
                { status: 429 }
            );
        }

        // Send email using Resend
        const result = await sendContactFormEmail({
            name,
            email,
            phone,
            message,
        });

        if (result.success) {
            return NextResponse.json({
                message: 'Email sent successfully',
                emailId: result.data?.data?.id
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Apply security middleware with contact form specific configuration
export const POST = withApiSecurity(handleContactForm, {
    requireAuth: false,
    requireAdmin: false,
    rateLimit: RATE_LIMITS.CONTACT_FORM,
    allowedMethods: ['POST'],
    validateInput: true,
    cors: {
        origins: [
            'https://hopeinternationalcare.org',
            'https://www.hopeinternationalcare.org',
            'http://localhost:3000',
        ],
        methods: ['POST', 'OPTIONS'],
        headers: ['Content-Type'],
    },
});
