'use server';

// Compatibility layer for course category server actions
// This file provides backward compatibility for existing code
// while redirecting to the new optimized implementations

import type { ZodInsertCourseCategoryType } from '@/lib/db/drizzle-zod-schema/course-categories';
import {
    adminCourseCategoryCreate,
    adminCourseCategoryUpdate,
    adminCourseCategoryList as adminCourseCategoryListOptimized,
    adminCourseCategoryDetails as adminCourseCategoryDetailsOptimized,
    adminCourseCategoryDelete as adminCourseCategoryDeleteOptimized,
} from '@/lib/server-actions/admin/course-categories-optimized';
import type { CourseCategoryBase } from '@/lib/types/course-categories';

/**
 * Compatibility wrapper for adminCourseCategoryUpsert
 */
export async function adminCourseCategoryUpsert(
    input: ZodInsertCourseCategoryType
) {
    try {
        let result;
        if (input.id) {
            // Update existing category
            result = await adminCourseCategoryUpdate({
                id: input.id,
                name: input.name,
                description: input.description,
            });
        } else {
            // Create new category
            result = await adminCourseCategoryCreate({
                name: input.name,
                description: input.description,
            });
        }

        if (result.success && result.data) {
            return { success: true, data: result.data };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            error: e.message,
        };
    }
}

/**
 * Compatibility wrapper for adminCourseCategoryListAll
 */
export async function adminCourseCategoryListAll() {
    try {
        const result = await adminCourseCategoryListOptimized({
            page: 1,
            pageSize: 9999, // Large number to get all categories
        });

        if (result.success && result.data) {
            return { success: true, data: result.data.data };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            error: e.message,
        };
    }
}

/**
 * Compatibility wrapper for adminCourseCategoryList
 */
export async function adminCourseCategoryList(params: any) {
    try {
        const result = await adminCourseCategoryListOptimized({
            page: params.page || 1,
            pageSize: params.pageSize || 10,
            sortBy: params.sortBy || 'created_at',
            order: params.order || 'desc',
            filters: params.filters || [],
        });

        if (result.success && result.data) {
            return {
                success: true,
                data: result.data.data,
                total: result.data.total,
            };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            error: e.message,
        };
    }
}

/**
 * Compatibility wrapper for adminCourseCategoryDetailsById
 */
export async function adminCourseCategoryDetailsById(id: string) {
    try {
        if (!id) {
            return { success: false, error: 'Course Category ID is required' };
        }

        const result = await adminCourseCategoryDetailsOptimized(id);

        if (result.success && result.data) {
            return { success: true, data: result.data.category };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            error: e.message,
        };
    }
}

/**
 * Compatibility wrapper for adminCourseCategoryDeleteById
 */
export async function adminCourseCategoryDeleteById(id: string) {
    try {
        const result = await adminCourseCategoryDeleteOptimized(id);

        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            error: e.message,
        };
    }
}

// Cache wrappers for compatibility
import { cache } from 'react';
export const cachedAdminCourseCategoryListAll = cache(
    adminCourseCategoryListAll
);
export const cachedAdminCourseCategoryList = cache(adminCourseCategoryList);
export const cachedAdminCourseCategoryDetailsById = cache(
    adminCourseCategoryDetailsById
);
