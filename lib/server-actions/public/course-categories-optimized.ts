'use server';

import { desc, eq, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import { courseCategories as courseCategoriesTable } from '@/lib/db/schema/course-categories';
import { PublicCourseCategoryListItem } from '@/lib/types/public/course-categories';
import { logger } from '@/lib/utils/logger';
import { ApiResponse } from '@/lib/types';

/**
 * Get all course categories
 */
export async function publicGetAllCategories(): Promise<
    ApiResponse<PublicCourseCategoryListItem[]>
> {
    try {
        const data = await db
            .select({
                id: courseCategoriesTable.id,
                name: courseCategoriesTable.name,
                description: courseCategoriesTable.description,
                created_at: courseCategoriesTable.created_at,
            })
            .from(courseCategoriesTable)
            .orderBy(desc(courseCategoriesTable.created_at));

        return { success: true, data };
    } catch (error) {
        logger.error(
            'Error fetching public course categories:',
            error instanceof Error
                ? { message: error.message, stack: error.stack }
                : { error: String(error) }
        );
        return {
            success: false,
            error: 'Failed to fetch all categories',
            code: 'FETCH_ERROR',
        };
    }
}

// Cached version using React cache
export const getCachedPublicAllCategories = cache(publicGetAllCategories);
