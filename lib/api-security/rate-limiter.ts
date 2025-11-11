// Rate Limiter for API Security
import { NextRequest } from 'next/server';

interface RateLimitResult {
    success: boolean;
    remaining?: number;
    retryAfter?: number;
}

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries on demand (serverless-friendly)
function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

export async function rateLimit(
    request: NextRequest,
    maxRequests: number,
    windowSeconds: number
): Promise<RateLimitResult> {
    // Cleanup expired entries on demand
    cleanupExpiredEntries();

    // Get client identifier (IP address or user ID if authenticated)
    const clientId = getClientIdentifier(request);
    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(clientId);

    if (!entry || now > entry.resetTime) {
        // Create new entry or reset expired entry
        entry = {
            count: 1,
            resetTime: now + windowMs,
        };
        rateLimitStore.set(clientId, entry);

        return {
            success: true,
            remaining: maxRequests - 1,
        };
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return {
            success: false,
            remaining: 0,
            retryAfter,
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(clientId, entry);

    return {
        success: true,
        remaining: maxRequests - entry.count,
    };
}

// Get client identifier for rate limiting
function getClientIdentifier(request: NextRequest): string {
    // Try to get IP address from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    const ip =
        forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';

    // For authenticated requests, you might want to use user ID instead
    // This would require parsing the auth token, but for now we'll use IP
    return `ip:${ip}`;
}

// Different rate limit configurations for different endpoints
export const RATE_LIMITS = {
    // Public endpoints
    PUBLIC: {
        requests: 100,
        window: 900, // 15 minutes
    },

    // Contact form (more restrictive)
    CONTACT_FORM: {
        requests: 5,
        window: 300, // 5 minutes
    },

    // Authentication endpoints
    AUTH: {
        requests: 10,
        window: 900, // 15 minutes
    },

    // Admin endpoints
    ADMIN: {
        requests: 200,
        window: 900, // 15 minutes
    },

    // User endpoints
    USER: {
        requests: 150,
        window: 900, // 15 minutes
    },

    // Email endpoints
    EMAIL: {
        requests: 10,
        window: 3600, // 1 hour
    },
} as const;

// Endpoint-specific rate limiting
export async function rateLimitByEndpoint(
    request: NextRequest,
    endpoint: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
    const config = RATE_LIMITS[endpoint];
    return rateLimit(request, config.requests, config.window);
}

// Advanced rate limiting with different tiers based on user type
export async function adaptiveRateLimit(
    request: NextRequest,
    userRole?: string
): Promise<RateLimitResult> {
    let config;

    switch (userRole) {
        case 'service_role':
            config = RATE_LIMITS.ADMIN;
            break;
        case 'authenticated':
            config = RATE_LIMITS.USER;
            break;
        default:
            config = RATE_LIMITS.PUBLIC;
    }

    return rateLimit(request, config.requests, config.window);
}

// Rate limit for specific actions (like password reset, email sending)
export async function actionRateLimit(
    request: NextRequest,
    action: string,
    maxAttempts: number = 3,
    windowSeconds: number = 3600
): Promise<RateLimitResult> {
    const clientId = getClientIdentifier(request);
    const key = `action:${action}:${clientId}`;

    const now = Date.now();
    const windowMs = windowSeconds * 1000;

    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
        entry = {
            count: 1,
            resetTime: now + windowMs,
        };
        rateLimitStore.set(key, entry);

        return {
            success: true,
            remaining: maxAttempts - 1,
        };
    }

    if (entry.count >= maxAttempts) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return {
            success: false,
            remaining: 0,
            retryAfter,
        };
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        success: true,
        remaining: maxAttempts - entry.count,
    };
}

// Clear rate limit for a specific client (useful for testing or admin override)
export function clearRateLimit(clientId: string): void {
    rateLimitStore.delete(clientId);
}

// Get current rate limit status for a client
export function getRateLimitStatus(
    clientId: string
): { count: number; resetTime: number } | null {
    return rateLimitStore.get(clientId) || null;
}
