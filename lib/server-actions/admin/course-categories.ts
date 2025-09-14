'use server';

// import type { InferSelectModel } from 'drizzle-orm';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { requireAdmin } from '@/utils/auth-guard';
import type { ZodInsertCourseCategoryType } from '@/lib/db/drizzle-zod-schema/course-categories';
import { ZodCourseCategoryInsertSchema } from '../../db/drizzle-zod-schema/course-categories';
import { cache } from 'react';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { courseCategories as courseCategoriesTable } from '@/lib/db/schema/course-categories';
import { buildPaginatedQuery, buildCountQuery } from '@/lib/utils/query-utils';
import { courseCategoryColumnMap, courseCategorySelectColumns } from '@/lib/utils/course-categories';



type ListParams = Partial<DataTableListParams>;

/**
 * Get All list of courses catgories
 */
export async function adminCourseCategoryListAll() {
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
    } catch (_error) {
        return { success: false, error: 'Failed to fetch all categories' };
    }
}

/**
 * Get paginated list of courses catgories
 */
export async function adminCourseCategoryList({
    page = 1,
    pageSize = 10,
    sortBy = 'created_at',
    order = 'desc',
    filters = [],
}: ListParams) {
    try {
        // Build paginated query using utility functions
        const baseQuery = db
            .select(courseCategorySelectColumns)
            .from(courseCategoriesTable);

        const query = buildPaginatedQuery({
            queryBuilder: baseQuery,
            columnMap: courseCategoryColumnMap,
            options: { page, pageSize, sortBy, order, filters }
        });

        // Build count query using utility function
        const countQuery = buildCountQuery({
            table: db.select().from(courseCategoriesTable),
            columnMap: courseCategoryColumnMap,
            filters
        });

        const [data, [{ count }]] = await Promise.all([
            query,
            countQuery,
        ]);

        return {
            success: true,
            data,
            total: count ?? 0,
        };
    } catch (_error) {
        return { success: false, error: 'Failed to fetch categories' };
    }
}

/**
 * Get single course category by ID
 */
export async function adminCourseCategoryDetailsById(id: string) {
    try {
        await requireAdmin();

        if (!id) {
            return { success: false, error: 'Course Category ID is required' };
        }

        const [category] = await db
            .select()
            .from(courseCategoriesTable)
            .where(eq(courseCategoriesTable.id, id));

        if (!category) {
            return { success: false, error: 'Category not found not found' };
        }

        return { success: true, data: category };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

/** 
 * Create or update course categories
 */

export async function adminCourseCategoryUpsert(
    input: ZodInsertCourseCategoryType
) {
    try {
        await requireAdmin();

        const { success, data: validateData, error: validationError } = ZodCourseCategoryInsertSchema.safeParse(input);

        if (!success) {
            return {
                success: false,
                error: validationError?.message,
            };
        }

        // Use Drizzle ORM for upsert operation
        const [upsertedData] = await db
            .insert(courseCategoriesTable)
            .values(validateData)
            .onConflictDoUpdate({
                target: courseCategoriesTable.id,
                set: validateData,
            })
            .returning();

        revalidatePath('/admin/courses_categories');
        return {
            success: true,
            data: upsertedData,
        };
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            error: e.message,
        };
    }
}

/**
 * Delete course categories by ID
 */
export async function adminCourseCategoryDeleteById(id: string) {
    try {
        await requireAdmin();

        const [deletedData] = await db
            .delete(courseCategoriesTable)
            .where(eq(courseCategoriesTable.id, id))
            .returning();

        revalidatePath('/admin/courses_categories');
        return { success: true, data: deletedData };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export const cachedAdminCourseCategoryListAll = cache(
    adminCourseCategoryListAll
);
export const cachedAdminCourseCategoryList = cache(adminCourseCategoryList);
export const cachedAdminCourseCategoryDetailsById = cache(
    adminCourseCategoryDetailsById
);
