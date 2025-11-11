import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase/server';

/**
 * Middleware to check if a user is deleted and handle routing accordingly
 */
export async function userDeletionMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only apply to admin user management routes
    if (!pathname.startsWith('/admin/users')) {
        return NextResponse.next();
    }

    // Skip middleware for deleted users routes (they should be accessible)
    if (pathname.includes('/deleted')) {
        return NextResponse.next();
    }

    // Extract user ID from the path if present
    const userIdMatch = pathname.match(/\/admin\/users\/([^\/]+)/);
    if (!userIdMatch) {
        return NextResponse.next();
    }

    const userId = userIdMatch[1];

    // Skip if it's not a valid UUID (might be 'new' or other route)
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
        return NextResponse.next();
    }

    try {
        const supabase = await createServerSupabaseClient();

        // Check if user is deleted
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('deleted_at, deletion_scheduled_for')
            .eq('id', userId)
            .single();

        if (error) {
            // If user doesn't exist, let the route handle it
            return NextResponse.next();
        }

        // If user is deleted or scheduled for deletion, redirect to deleted users page
        // if (profile?.deleted_at || profile?.deletion_scheduled_for) {
        //     const redirectUrl = new URL(`/admin/users/deleted/${userId}/history`, request.url);
        //     return NextResponse.redirect(redirectUrl);
        // }

        return NextResponse.next();
    } catch (error) {
        console.error('Error in user deletion middleware:', error);
        // On error, continue to the route
        return NextResponse.next();
    }
}

/**
 * Check if a user has permission to access deleted user management
 */
export async function checkDeletedUserPermissions(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only apply to deleted users routes
    if (!pathname.includes('/admin/users/deleted')) {
        return NextResponse.next();
    }

    try {
        const supabase = await createServerSupabaseClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            const loginUrl = new URL('/admin-auth/sign-in', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            const unauthorizedUrl = new URL('/admin', request.url);
            return NextResponse.redirect(unauthorizedUrl);
        }

        // if (profile && profile.role === null) {
        //     const unauthorizedUrl = new URL('/admin', request.url);
        //     return NextResponse.redirect(unauthorizedUrl);
        // }
        //
        // // Check if user has admin permissions
        // const allowedRoles = ['admin', 'super_admin'];
        // if (!allowedRoles.includes(profile?.role ?? 'unknown_role')) {
        //     const unauthorizedUrl = new URL('/admin', request.url);
        //     return NextResponse.redirect(unauthorizedUrl);
        // }

        return NextResponse.next();
    } catch (error) {
        console.error('Error checking deleted user permissions:', error);
        const errorUrl = new URL('/admin', request.url);
        return NextResponse.redirect(errorUrl);
    }
}

/**
 * Validate user deletion history access
 */
export async function validateHistoryAccess(
    request: NextRequest,
    userId: string
) {
    try {
        const supabase = await createServerSupabaseClient();

        // Check if the user exists in deletion history
        const { data: history, error } = await supabase
            .from('user_deletion_history')
            .select('user_id')
            .eq('user_id', userId)
            .limit(1);

        if (error) {
            throw error;
        }

        // If no history found, user might not exist or never been deleted
        if (!history || history.length === 0) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validating history access:', error);
        return false;
    }
}

/**
 * Rate limiting for user deletion operations
 */
export async function rateLimitDeletionOperations(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only apply to deletion/restoration endpoints
    if (
        !pathname.includes('/api/admin/users') ||
        (!pathname.includes('delete') && !pathname.includes('restore'))
    ) {
        return NextResponse.next();
    }

    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.next();
        }

        // Check recent deletion operations by this admin
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: recentOperations, error } = await supabase
            .from('user_deletion_history')
            .select('id')
            .eq('deleted_by', user.id)
            .gte('deleted_at', oneHourAgo);

        if (error) {
            console.error('Error checking rate limit:', error);
            return NextResponse.next();
        }

        // Limit to 50 operations per hour
        if (recentOperations && recentOperations.length >= 50) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        'Rate limit exceeded. Please wait before performing more deletion operations.',
                },
                { status: 429 }
            );
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error in rate limiting middleware:', error);
        return NextResponse.next();
    }
}

/**
 * Audit logging middleware for user deletion routes
 */
export async function auditDeletionRoutes(request: NextRequest) {
    const {
        nextUrl: { pathname },
        method,
    } = request;
    // Only log sensitive operations
    if (!pathname.includes('/admin/users') || method === 'GET') {
        return NextResponse.next();
    }

    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user) {
            // Extract the IP address
            const ip =
                request.headers.get('x-forwarded-for')?.split(',').shift() ?? // Get the first IP in the list // request?.ip ?? // Fallback to request.ip if available
                'Unknown IP'; // Default fallback
            // Log the operation (in a real implementation, this would go to an audit table)
            console.log('Admin operation audit:', {
                adminId: user.id,
                path: pathname,
                method,
                timestamp: new Date().toISOString(),
                userAgent: request.headers.get('user-agent'),
                ip: ip,
            });
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error in audit middleware:', error);
        return NextResponse.next();
    }
}
