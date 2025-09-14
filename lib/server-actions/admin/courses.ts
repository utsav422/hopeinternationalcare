'use server';

import { type AnyColumn, asc, desc, eq, gte, inArray, lte, type SQL, sql, } from 'drizzle-orm';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { ZodCourseInsertSchema } from '@/lib/db/drizzle-zod-schema/courses';
import { requireAdmin } from '@/utils/auth-guard';
import { handleCourseImage } from './course-image-utils';

// import { createServerSupabaseClient } from '@/utils/supabase/server'
import type { ColumnFilter } from '@tanstack/react-table';
import { cache } from 'react';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { affiliations } from '@/lib/db/schema/affiliations';
import { courseCategories } from '@/lib/db/schema/course-categories';
import { courses as coursesTable } from '@/lib/db/schema/courses';
import { enrollments } from '@/lib/db/schema/enrollments';
import { intakeRelations, intakes } from '@/lib/db/schema/intakes';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { isValidTableColumnName } from '@/utils/utils';
import type { ZodSelectCourseType } from '../../db/drizzle-zod-schema';
import { buildFilterConditions, buildWhereClause, buildOrderByClause } from '@/lib/utils/query-utils';
import { courseColumnMap, courseSelectColumns } from '@/lib/utils/courses';

type ListParams = Partial<DataTableListParams>;

/**
 * Get a paginated list of courses
 * ListParams = {
 *      page: number
 *      pageSize: number
 *      sortBy: string
 *      order: "asc" | "desc"
 *      filters: ColumnFiltersState
 *  }
 */
export async function adminCourseList({
    page = 1,
    pageSize = 10,
    sortBy = 'created_at',
    order = 'desc',
    filters = [],
}: ListParams) {
    try {
        // Build filter conditions using utility function
        const filterConditions = buildFilterConditions(filters, courseColumnMap);
        const whereClause = buildWhereClause(filterConditions);

        // Build order by clause using utility function
        const sort = buildOrderByClause(sortBy, order, courseColumnMap);

        const baseQuery = db
            .select(courseSelectColumns)
            .from(coursesTable)
            .leftJoin(
                courseCategories,
                eq(coursesTable.category_id, courseCategories.id)
            )
            .leftJoin(
                affiliations,
                eq(coursesTable.affiliation_id, affiliations.id)
            )
            .where(whereClause)
        if (sort) {
            baseQuery.orderBy(sort);
        }
        baseQuery.limit(pageSize)
            .offset((page - 1) * pageSize);

        const countQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(coursesTable)
            .leftJoin(
                courseCategories,
                eq(coursesTable.category_id, courseCategories.id)
            )
            .leftJoin(
                affiliations,
                eq(coursesTable.affiliation_id, affiliations.id)
            )
            .where(whereClause);

        const [data, [{ count }]] = await Promise.all([baseQuery, countQuery]);

        return {
            success: true,
            data,
            total: count ?? 0,
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message || 'Failed to fetch courses' };
    }
}

/**
 * Alias for adminCourseList - used in the courses page
 */
export async function adminGetCourses(params: ListParams) {
    return adminCourseList(params);
}

/**
 * Get All courses
 */
export async function adminCourseListAll() {
    try {
        const data = await db
            .select(courseSelectColumns)
            .from(coursesTable)
            .leftJoin(
                courseCategories,
                eq(coursesTable.category_id, courseCategories.id)
            )
            .leftJoin(
                affiliations,
                eq(coursesTable.affiliation_id, affiliations.id)
            )
            .orderBy(desc(coursesTable.created_at));

        return {
            success: true,
            data,
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message || 'Failed to fetch all courses' };
    }
}

/**
 *  * Get single course by ID
 *  */

export async function adminCourseDetailsById(id: string) {
    try {
        await requireAdmin();

        if (!id) {
            return { success: false, error: 'Course ID is required' };
        }

        const [course] = await db
            .select(courseSelectColumns)
            .from(coursesTable)
            .leftJoin(
                courseCategories,
                eq(coursesTable.category_id, courseCategories.id)
            )
            .leftJoin(
                affiliations,
                eq(coursesTable.affiliation_id, affiliations.id)
            )
            .where(eq(coursesTable.id, id));

        if (!course) {
            return { success: false, error: 'Course not found' };
        }

        return { success: true, data: course };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

/**
 * Create or update course
 */
export async function adminCourseUpsert(formData: FormData) {
    try {
        await requireAdmin();

        const rawFormData = Object.fromEntries(formData.entries());
        const imageFile = formData.get('image_file') as File | null;
        const oldImageUrl = formData.get('image_url') as string | null;

        const validatedFields = ZodCourseInsertSchema.safeParse({
            ...rawFormData,
            level: Number(rawFormData.level),
            price: Number(rawFormData.price),
            duration_value: Number(rawFormData.duration_value),
        });

        if (!validatedFields.success) {
            return {
                success: false,
                error: 'Invalid form data',
            };
        }

        const client = await createServerSupabaseClient();
        let imageUrl = validatedFields.data.image_url;

        // Handle image upload/deletion only if needed
        if (imageFile && imageFile.size > 0) {
            try {
                const { publicUrl } = await handleCourseImage(imageFile, oldImageUrl);
                if (publicUrl) {
                    imageUrl = publicUrl;
                }
            } catch (error) {
                const e = error as Error;
                return {
                    success: false,
                    error: e.message,
                };
            }
        }

        // Generate slug from title
        const slug = validatedFields.data.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const finalValues = {
            ...validatedFields.data,
            image_url: imageUrl,
            slug,
        };

        const [upsertedData] = await db
            .insert(coursesTable)
            .values(finalValues)
            .onConflictDoUpdate({
                target: coursesTable.id,
                set: finalValues,
            })
            .returning();

        revalidatePath('/admin/courses');
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
 * Create or update course category_id of course
 */
type CourseFormInput = ZodSelectCourseType;

export async function adminCourseUpdateCategoryId(
    input: Partial<CourseFormInput>
) {
    try {
        await requireAdmin();
        if (!input.id) {
            return { success: false, error: 'course id is is missing' };
        }
        if (!input.category_id) {
            return { success: false, error: 'category id is missing' };
        }
        // Use Drizzle ORM for update operation
        const [updatedData] = await db
            .update(coursesTable)
            .set({
                category_id: input.category_id,
            })
            .where(eq(coursesTable.id, input.id))
            .returning();

        revalidatePath('/admin/courses');

        return {
            success: true,
            data: updatedData,
        };
    } catch (error) {
        const e = error as Error;
        return {
            success: false,
            error: e.message,
        };
    }
}

/** * Delete course by ID with constraint checking */
export async function adminCourseDeleteById(id: string) {
    try {
        await requireAdmin();
      
        // Check if course is referenced by any intakes
        const [{ intakeCount }] = await db
            .select({ intakeCount: sql<number>`count(*)`})
            .from(intakes)
            .where(eq(intakes.course_id, id));

            if (intakeCount > 0) {
                return { 
                    success: false, 
                    error: `Cannot delete: referenced by ${intakeCount} intake(s). Update or remove those intakes first.` 
                };
            }

        // Proceed with deletion
        const [deletedData] = await db
            .delete(coursesTable)
            .where(eq(coursesTable.id, id))
            .returning();

        revalidatePath('/admin/courses');
        return { success: true, data: deletedData };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export const cachedAdminCourseList = cache(adminCourseList);
export const cachedAdminCourseListAll = cache(adminCourseListAll);
export const cachedAdminCourseDetailsById = cache(adminCourseDetailsById);