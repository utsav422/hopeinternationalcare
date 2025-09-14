// Enhanced Auth Guard for Hope International
import {createServerSupabaseClient} from '@/utils/supabase/server';
import {logger} from '@/utils/logger';
import {User} from '@supabase/supabase-js';
import {db} from "@/lib/db/drizzle";
import {profiles} from "@/lib/db/schema";
import {and, eq} from "drizzle-orm";

// Helper function to check user deletion status
export async function checkUserDeletionStatus(userId: string) {
    try {
        const data = await db.select({
            deleted_at: profiles.deleted_at,
            deletion_scheduled_for: profiles.deletion_scheduled_for
        }).from(profiles).where(eq(profiles.id, userId))
        // const {data: profile, error} = await client
        //     .from('profiles')
        //     .select('deleted_at, deletion_scheduled_for')
        //     .eq('id', userId)
        //     .single();
        //
        if (data.length === 0) {
            return {isDeleted: false, isScheduledForDeletion: false};
        }
        const profile = data[0]
        const isDeleted = !!profile.deleted_at;
        const isScheduledForDeletion = !!profile.deletion_scheduled_for &&
            new Date(profile.deletion_scheduled_for) <= new Date();

        return {isDeleted, isScheduledForDeletion};
    } catch (error) {
        logger.error('Error checking user deletion status', {error, userId});
        return {isDeleted: false, isScheduledForDeletion: false};
    }
}

export async function requireAdmin() {
    try {
        const client = await createServerSupabaseClient();
        const {
            data: {user},
            error,
        } = await client.auth.getUser();

        if (error) {
            logger.warn('Auth error in requireAdmin', {error: error.message});
            throw new Error('Authentication failed');
        }

        if (!user) {
            logger.warn('No user found in requireAdmin');
            throw new Error('Authentication required');
        }

        // Check if user is soft-deleted
        const {isDeleted, isScheduledForDeletion} = await checkUserDeletionStatus(user.id);
        if (isDeleted || isScheduledForDeletion) {
            logger.warn('Deleted user attempted admin access', {userId: user.id});
            throw new Error('Your account has been deactivated. Please contact support at info@hopeinternational.com.np');
        }

        if (user.role !== 'service_role') {
            logger.warn('Insufficient permissions in requireAdmin', {
                userId: user.id,
                role: user.role
            });
            throw new Error('Admin access required');
        }

        logger.info('Admin access granted', {userId: user.id});
        return {error: null, user: {...user, role: user.role}};
    } catch (error) {
        logger.error('Error in requireAdmin', {error: error instanceof Error ? error.message : 'Unknown error'});
        throw error;
    }
}

export async function requireUser(): Promise<User> {
    // try {
    const client = await createServerSupabaseClient();
    const {
        data: {user},
        error,
    } = await client.auth.getUser();

    if (error) {
        logger.warn('Auth error in requireUser', {error: error.message});
        throw new Error('Authentication failed');
    }

    if (!user) {
        logger.warn('No user found in requireUser');
        throw new Error('Authentication required');
    }

    // Check if a user is soft-deleted
    const {isDeleted, isScheduledForDeletion} = await checkUserDeletionStatus(user.id);
    if (isDeleted || isScheduledForDeletion) {
        logger.warn('Deleted user attempted access', {userId: user.id});
        throw new Error('Your account has been deactivated. Please contact support at info@hopeinternational.com.np');
    }

    // Get a user profile to check a role (only active users)
    const data = await db.select({
        deleted_at: profiles.deleted_at,
        role: profiles.role
    }).from(profiles).where(and(eq(profiles.id, user.id), eq(profiles.deleted_at, '')))

    // const {data: profile, error: profileError} = await client
    //     .from('profiles')
    //     .select('role')
    //     .eq('id', user.id)
    //     .is('deleted_at', null)
    //     .single();
    if (data.length === 0) {
        logger.warn('Profile not found in requireUser', {userId: user.id});
        throw new Error('User profile not found');
    }
    const profile = data[0]

    if (profile?.role && ['authenticated', 'service_role'].includes(profile.role)) {
        logger.info('User access granted', {userId: user.id, role: profile.role});
        return {...user, role: profile.role};
    } else {
        logger.warn('Invalid role in requireUser', {
            userId: user.id,
            role: profile.role
        });
        throw new Error('Invalid user role');
    }
    // } catch (error) {
    //     logger.error('Error in requireUser', {error: error instanceof Error ? error.message : 'Unknown error'});
    //     throw error;
    // }
}

// New function to get current user without throwing
export async function getCurrentUser() {
    try {
        const client = await createServerSupabaseClient();
        const {
            data: {user},
            error,
        } = await client.auth.getUser();

        if (error || !user) {
            return null;
        }

        // Check if user is soft-deleted
        const {isDeleted, isScheduledForDeletion} = await checkUserDeletionStatus(user.id);
        if (isDeleted || isScheduledForDeletion) {
            return null; // Return null for deleted users
        }

        // Get user profile (only active users)
        // const {data: profile} = await client
        //     .from('profiles')
        //     .select('role')
        //     .eq('id', user.id)
        //     .eq('deleted_at', '')
        // .single();
        // Get a user profile to check a role (only active users)
        const data = await db.select({
            deleted_at: profiles.deleted_at,
            role: profiles.role
        }).from(profiles).where(and(eq(profiles.id, user.id), eq(profiles.deleted_at, '')))

        if (data.length === 0) {
            logger.warn('Profile not found in requireUser', {userId: user.id});
            throw new Error('User profile not found');
        }
        const profile = data[0]

        return profile ? {...user, role: profile.role} : null;
    } catch (error) {
        logger.error('Error in getCurrentUser', {error: error instanceof Error ? error.message : 'Unknown error'});
        return null;
    }
}

// Check if user has specific role
export async function hasRole(requiredRole: string): Promise<boolean> {
    try {
        const user = await getCurrentUser();
        return user?.role === requiredRole;
    } catch {
        return false;
    }
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
    return hasRole('service_role');
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
    try {
        const user = await getCurrentUser();
        return !!user;
    } catch {
        return false;
    }
}
