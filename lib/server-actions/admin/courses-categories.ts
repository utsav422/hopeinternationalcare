'use server';

// import type { InferSelectModel } from 'drizzle-orm';
import { type AnyColumn, asc, desc, eq, type SQL, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { requireAdmin } from '@/utils/auth-guard';
import type { TablesInsert } from '@/utils/supabase/database.types';
import { ZodCourseCategoryInsertSchema } from '../../db/drizzle-zod-schema/course-categories';

// import { createServerSupabaseClient } from '@/utils/supabase/server'

import type { ColumnFilter } from '@tanstack/react-table';
import { cache } from 'react';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { courseCategories as courseCategoriesTable } from '@/lib/db/schema/course-categories';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { isValidTableColumnName } from '@/utils/utils';

// type CourseWithDetails = InferSelectModel<typeof coursesTable>;

// type CourseFormInput = Omit<TablesInsert<'courses'>, 'created_at'> & {
//     created_at?: Date
// }

type ListParams = Partial<DataTableListParams>;

/**
 * Get All list of courses catgories
 */
export async function adminGetAllCatogies() {
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
export async function adminGetCoursesCategories({
  page = 1,
  pageSize = 10,
  sortBy = 'created_at',
  order = 'desc',
  filters = [],
}: ListParams) {
  try {
    const offset = (page - 1) * pageSize;
    const selectColumns = {
      id: courseCategoriesTable.id,
      name: courseCategoriesTable.name,
      description: courseCategoriesTable.description,
      created_at: courseCategoriesTable.created_at,
      updated_at: courseCategoriesTable.updated_at,
    };
    const columnMap: Record<string, AnyColumn> = {
      id: courseCategoriesTable.id,
      name: courseCategoriesTable.name,
      description: courseCategoriesTable.description,
      created_at: courseCategoriesTable.created_at,
      updated_at: courseCategoriesTable.updated_at,
    };

    const filterConditions = filters
      ?.map((filter: ColumnFilter) => {
        const col = columnMap[filter.id];
        if (col && typeof filter.value === 'string') {
          return sql`to_tsvector('english', ${col}) @@ to_tsquery('english', ${filter.value} || ':*')`;
        }
        return null;
      })
      .filter(Boolean);
    const whereClause =
      filterConditions?.length > 0
        ? sql.join(filterConditions as SQL<unknown>[], sql` AND `)
        : undefined;

    const sortColumn: AnyColumn = isValidTableColumnName(
      sortBy,
      courseCategoriesTable
    )
      ? (courseCategoriesTable[sortBy] as AnyColumn)
      : courseCategoriesTable.created_at;
    const sort = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    // Base query
    const baseQuery = db
      .select(selectColumns)
      .from(courseCategoriesTable)
      .where(whereClause);

    // Count query
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(courseCategoriesTable)
      .where(whereClause);

    const [data, [{ count }]] = await Promise.all([
      baseQuery.limit(pageSize).offset(offset).orderBy(sort),
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
export async function adminGetCourseCategoriesById(id: string) {
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
      return { success: false, error: 'Course not found' };
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
type CourseCategoryFormInput = TablesInsert<'course_categories'>;

export async function adminUpsertCourseCategories(
  input: CourseCategoryFormInput
) {
  try {
    await requireAdmin();

    const validatedFields = ZodCourseCategoryInsertSchema.safeParse(input);

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.message,
      };
    }
    const client = await createServerSupabaseClient();
    const { data, error } = await client
      .from('course_categories')
      .upsert(
        {
          ...validatedFields.data,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/courses_categories');

    return {
      success: true,
      data,
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
export async function adminDeleteCourseCategories(id: string) {
  try {
    const client = await createServerSupabaseClient();

    const { error } = await client
      .from('course_categories')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/courses_categories');
    return { success: true, data: null };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export const getCachedAdminAllCatogies = cache(adminGetAllCatogies);
export const getCachedAdminCoursesCategories = cache(adminGetCoursesCategories);
export const getCachedAdminCourseCategoriesById = cache(
  adminGetCourseCategoriesById
);
