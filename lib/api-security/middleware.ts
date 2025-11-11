// API Security Middleware for Hope International
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { rateLimit } from './rate-limiter';
import { validateApiKey } from './api-key-validator';
import { sanitizeInput } from './input-sanitizer';
import { logger } from '@/utils/logger';
import { profiles } from '@/lib/db/schema';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';

export interface SecurityConfig {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    rateLimit?: {
        requests: number;
        window: number; // in seconds
    };
    requireApiKey?: boolean;
    allowedMethods?: string[];
    validateInput?: boolean;
    cors?: {
        origins: string[];
        methods: string[];
        headers: string[];
    };
}

export interface AuthenticatedRequest extends NextRequest {
    user?: any;
    userId?: string;
    userRole?: string;
}

// Default security configuration
const DEFAULT_CONFIG: SecurityConfig = {
    requireAuth: false,
    requireAdmin: false,
    rateLimit: {
        requests: 100,
        window: 900, // 15 minutes
    },
    requireApiKey: false,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    validateInput: true,
    cors: {
        origins: [
            'https://hopeinternationalcare.org',
            'https://www.hopeinternationalcare.org',
            'http://localhost:3000', // Development
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'X-API-Key'],
    },
};

export function withApiSecurity(
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
    config: SecurityConfig = {}
) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    return async (request: NextRequest): Promise<NextResponse> => {
        const startTime = Date.now();
        const requestId = crypto.randomUUID();

        try {
            // Log incoming request
            logger.info('API Request', {
                requestId,
                method: request.method,
                url: request.url,
                userAgent: request.headers.get('user-agent'),
                ip:
                    request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    request.headers.get('cf-connecting-ip') ||
                    'unknown',
            });

            // 1. CORS Handling
            const corsResponse = handleCors(request, finalConfig.cors!);
            if (corsResponse) return corsResponse;

            // 2. Method Validation
            if (!finalConfig.allowedMethods?.includes(request.method)) {
                return NextResponse.json(
                    { error: 'Method not allowed' },
                    { status: 405 }
                );
            }

            // 3. Rate Limiting
            if (finalConfig.rateLimit) {
                const rateLimitResult = await rateLimit(
                    request,
                    finalConfig.rateLimit.requests,
                    finalConfig.rateLimit.window
                );
                if (!rateLimitResult.success) {
                    return NextResponse.json(
                        {
                            error: 'Rate limit exceeded',
                            retryAfter: rateLimitResult.retryAfter,
                        },
                        {
                            status: 429,
                            headers: {
                                'Retry-After':
                                    rateLimitResult.retryAfter?.toString() ||
                                    '900',
                                'X-RateLimit-Limit':
                                    finalConfig.rateLimit.requests.toString(),
                                'X-RateLimit-Remaining':
                                    rateLimitResult.remaining?.toString() ||
                                    '0',
                            },
                        }
                    );
                }
            }

            // 4. API Key Validation (if required)
            if (finalConfig.requireApiKey) {
                const apiKeyValid = await validateApiKey(request);
                if (!apiKeyValid) {
                    return NextResponse.json(
                        { error: 'Invalid or missing API key' },
                        { status: 401 }
                    );
                }
            }

            // 5. Authentication & Authorization
            const authRequest = request as AuthenticatedRequest;

            if (finalConfig.requireAuth || finalConfig.requireAdmin) {
                const authResult = await authenticateRequest(authRequest);
                if (!authResult.success) {
                    return NextResponse.json(
                        { error: authResult.error },
                        { status: 401 }
                    );
                }

                // Check admin role if required
                if (
                    finalConfig.requireAdmin &&
                    authRequest.userRole !== 'service_role'
                ) {
                    return NextResponse.json(
                        { error: 'Admin access required' },
                        { status: 403 }
                    );
                }
            }

            // 6. Input Sanitization
            if (
                finalConfig.validateInput &&
                ['POST', 'PUT', 'PATCH'].includes(request.method)
            ) {
                try {
                    const body = await request.json();
                    const sanitizedBody = sanitizeInput(body);
                    // Replace the request body with sanitized version
                    (authRequest as any)._sanitizedBody = sanitizedBody;
                } catch (error) {
                    return NextResponse.json(
                        { error: 'Invalid JSON in request body' },
                        { status: 400 }
                    );
                }
            }

            // 7. Execute the actual handler
            const response = await handler(authRequest);

            // 8. Add security headers to response
            addSecurityHeaders(response);

            // Log successful response
            const duration = Date.now() - startTime;
            logger.info('API Response', {
                requestId,
                status: response.status,
                duration: `${duration}ms`,
            });

            return response;
        } catch (error) {
            // Log error
            const duration = Date.now() - startTime;
            logger.error('API Error', {
                requestId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: `${duration}ms`,
            });

            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

// CORS handling
function handleCors(
    request: NextRequest,
    corsConfig: SecurityConfig['cors']
): NextResponse | null {
    const origin = request.headers.get('origin');

    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin':
                    origin && corsConfig?.origins.includes(origin)
                        ? origin
                        : '',
                'Access-Control-Allow-Methods':
                    corsConfig?.methods.join(', ') || '',
                'Access-Control-Allow-Headers':
                    corsConfig?.headers.join(', ') || '',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    return null;
}

// Authentication
async function authenticateRequest(
    request: AuthenticatedRequest
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user) {
            return { success: false, error: 'Authentication required' };
        }

        // Get user profile for role information
        const data = await db
            .select({ role: profiles.role })
            .from(profiles)
            .where(eq(profiles.id, user.id));
        if (data.length === 0) {
            return { success: false, error: 'Authentication required' };
        }
        const profile = data[0];

        request.user = user;
        request.userId = user.id;
        request.userRole = profile?.role || 'authenticated';

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Authentication failed' };
    }
}

// Add security headers
function addSecurityHeaders(response: NextResponse) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
    );

    // Only add HSTS in production
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains'
        );
    }
}

// Helper function to get sanitized body from request
export function getSanitizedBody(request: AuthenticatedRequest): any {
    return (request as any)._sanitizedBody;
}
