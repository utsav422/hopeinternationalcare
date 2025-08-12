'use server';

import {
  type AnyColumn,
  asc,
  desc,
  eq,
  gte,
  inArray,
  lte,
  type SQL,
  sql,
} from 'drizzle-orm';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { ZodCourseInsertSchema } from '@/lib/db/drizzle-zod-schema/courses';
import { requireAdmin } from '@/utils/auth-guard';

// import { createServerSupabaseClient } from '@/utils/supabase/server'

import type { ColumnFilter } from '@tanstack/react-table';
import { cache } from 'react';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { courseCategories } from '@/lib/db/schema/course-categories';
import { courses as coursesTable } from '@/lib/db/schema/courses';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { isValidTableColumnName } from '@/utils/utils';
import type { ZodSelectCourseType } from '../../db/drizzle-zod-schema';

type ListParams = Partial<DataTableListParams>;
/**
 * Get paginated list of courses
 */
export async function adminGetCourses({
  page = 1,
  pageSize = 10,
  sortBy = 'created_at',
  order = 'desc',
  filters = [],
}: ListParams) {
  try {
    const offset = (page - 1) * pageSize;
    const columnMap: Record<string, AnyColumn> = {
      id: coursesTable.id,
      title: coursesTable.title,
      slug: coursesTable.slug,
      description: coursesTable.description,
      image_url: coursesTable.image_url,
      level: coursesTable.level,
      price: coursesTable.price,
      category_id: coursesTable.category_id,
      duration_type: coursesTable.duration_type,
      duration_value: coursesTable.duration_value,
      created_at: coursesTable.created_at,
      category_name: courseCategories.name,
    };
    const selectColumn = {
      id: coursesTable.id,
      title: coursesTable.title,
      slug: coursesTable.slug,
      description: coursesTable.description,
      image_url: coursesTable.image_url,
      level: coursesTable.level,
      price: coursesTable.price,
      category_id: coursesTable.category_id,
      duration_type: coursesTable.duration_type,
      duration_value: coursesTable.duration_value,
      created_at: coursesTable.created_at,
      category_name: courseCategories.name,
    };
    const filterConditions = filters
      ?.map((filter: ColumnFilter) => {
        const col = columnMap[filter.id];
        if (col && typeof filter.value === 'string') {
          return sql`to_tsvector('english', ${col}) @@ to_tsquery('english', ${filter.value} || ':*')`;
        }
        if (
          col &&
          Array.isArray(filter.value) &&
          filter.value.length > 0 &&
          ['status', 'method', 'duration_type'].includes(filter.id)
        ) {
          // For array filters, create a combined tsquery
          return inArray(col, filter.value);
        }
        // Handle numeric range filters [min, max]
        if (
          col &&
          Array.isArray(filter.value) &&
          filter.value.length === 2 &&
          typeof filter.value[0] === 'number' &&
          typeof filter.value[1] === 'number'
        ) {
          const [min, max] = filter.value;
          const conditions: SQL[] = [];
          if (min !== undefined && min !== null) {
            conditions.push(gte(col, min));
          }
          if (max !== undefined && max !== null) {
            conditions.push(lte(col, max));
          }
          if (conditions.length > 0) {
            return sql.join(conditions, sql` AND `);
          }
        }
        // Handle single numeric value filters (e.g., exact match)
        if (col && typeof filter.value === 'number') {
          return eq(col, filter.value);
        }
        return null;
      })
      .filter(Boolean);
    const whereClause =
      filterConditions?.length > 0
        ? sql.join(filterConditions as SQL<unknown>[], sql` AND `)
        : undefined;

    const sortColumn: AnyColumn = isValidTableColumnName(sortBy, coursesTable)
      ? (coursesTable[sortBy] as AnyColumn)
      : coursesTable.created_at;
    const sort = order === 'asc' ? asc(sortColumn) : desc(sortColumn);

    const baseQuery = db
      .select(selectColumn)
      .from(coursesTable)
      .leftJoin(
        courseCategories,
        eq(coursesTable.category_id, courseCategories.id)
      )
      .where(whereClause)
      .orderBy(sort)
      .limit(pageSize)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(coursesTable)
      .where(whereClause);
    const [data, [{ count }]] = await Promise.all([baseQuery, countQuery]);

    return {
      success: true,
      data,
      total: count ?? 0,
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch courses' };
  }
}

/**
 * Get All courses
 */
export async function adminGetAllCourses() {
  try {
    const data = await db
      .select({
        id: coursesTable.id,
        title: coursesTable.title,
        slug: coursesTable.slug,
        image_url: coursesTable.image_url,
        level: coursesTable.level,
        price: coursesTable.price,
        category_id: coursesTable.category_id,
        duration_type: coursesTable.duration_type,
        duration_value: coursesTable.duration_value,
        category_name: courseCategories.name,
      })
      .from(coursesTable)
      .leftJoin(
        courseCategories,
        eq(coursesTable.category_id, courseCategories.id)
      )
      .orderBy(desc(coursesTable.created_at));

    return {
      success: true,
      data,
    };
  } catch (_error) {
    return { success: false, error: 'Failed to fetch all courses' };
  }
}
/**
 * Get single course by ID
 */
export async function adminGetCourseById(id: string) {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false, error: 'Course ID is required' };
    }

    const [course] = await db
      .select()
      .from(coursesTable)
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
export async function adminUpsertCourse(formData: FormData) {
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

    if (imageFile && imageFile.size > 0) {
      if (oldImageUrl) {
        const oldImageKey = oldImageUrl.substring(
          oldImageUrl.lastIndexOf('media/') + 'media/'.length
        );
        try {
          await client.storage.from('media').remove([oldImageKey]);
        } catch (e) {
          const err = e as Error;
          return {
            success: false,
            error: `Failed to delete old image: ${err.message}`,
          };
        }
      }

      const fileName = `course_image/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await client.storage
        .from('media')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        return {
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        };
      }

      const {
        data: { publicUrl },
      } = client.storage.from('media').getPublicUrl(fileName);
      imageUrl = publicUrl;
    }

    const finalValues = {
      ...validatedFields.data,
      image_url: imageUrl,
      slug: validatedFields.data.title.toLowerCase().replace(/\s+/g, '-'),
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
export async function adminUpdateCourseCategoryIdCol(
  input: Partial<CourseFormInput>
) {
  try {
    await requireAdmin();
    if (!input.id) {
      return { success: false, error: 'course is is missing' };
    }
    if (!input.category_id) {
      return { success: false, error: 'category id is missing' };
    }
    const client = await createServerSupabaseClient();
    const { data, error } = await client
      .from('courses')
      .update({
        category_id: input.category_id,
      })
      .eq('id', input.id)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/courses');

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
 * Delete course by ID
 */
export async function adminDeleteCourse(id: string) {
  try {
    const client = await createServerSupabaseClient();

    const { error } = await client.from('courses').delete().eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/courses');
    return { success: true, data: null };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export const getCachedAdminGetCourses = cache(adminGetCourses);
export const getCachedAdminAllCourses = cache(adminGetAllCourses);
export const getCachedAdminCourseById = cache(adminGetCourseById);
