'use server';

import { requireUser, requireAdmin, getCurrentUser, hasRole, isAdmin, isAuthenticated } from '@/utils/auth-guard';

/**
 * Server action to check if user is authenticated
 */
export async function checkUserAuthenticated() {
    try {
        return await isAuthenticated();
    } catch (error) {
        return false;
    }
}

/**
 * Server action to check if user is admin
 */
export async function checkUserIsAdmin() {
    try {
        return await isAdmin();
    } catch (error) {
        return false;
    }
}

/**
 * Server action to check if user has a specific role
 */
export async function checkUserRole(role: string) {
    try {
        return await hasRole(role);
    } catch (error) {
        return false;
    }
}

/**
 * Server action to get current user
 */
export async function getCurrentUserAction() {
    try {
        return await getCurrentUser();
    } catch (error) {
        return null;
    }
}

/**
 * Server action that requires user authentication
 */
export async function requireUserAction() {
    try {
        return await requireUser();
    } catch (error) {
        throw error;
    }
}

/**
 * Server action that requires admin authentication
 */
export async function requireAdminAction() {
    try {
        return await requireAdmin();
    } catch (error) {
        throw error;
    }
}