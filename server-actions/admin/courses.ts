'use server';

// import type { InferSelectModel } from 'drizzle-orm';
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
import { requireAdmin } from '@/utils/auth-guard';
import { db } from '@/utils/db/drizzle';
import {
  ZodCourseInsertSchema,
  ZodCourseSelectSchema,
  type ZodSelectCourseType,
} from '@/utils/db/drizzle-zod-schema/courses';

// import { createServerSupabaseClient } from '@/utils/supabase/server'

import type { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import { cache } from 'react';
import type { ZodSafeParseResult } from 'zod/v4';
import { courseCategories } from '@/utils/db/schema/course-categories';
import { courses as coursesTable } from '@/utils/db/schema/courses';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { isValidTableColumnName } from '@/utils/utils';

// type CourseWithDetails = InferSelectModel<typeof coursesTable>;

// type CourseFormInput = Omit<TablesInsert<'courses'>, 'created_at'> & {
//     created_at?: Date
// }

type ListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
  filters?: ColumnFiltersState;
};
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
    data,
    total: count ?? 0,
  };
}

/**
 * Get All courses
 */
export async function adminGetAllCourses() {
  // Base query
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
    data,
  };
}
/**
 * Get single course by ID
 */
export async function adminGetCourseById(
  id: string
): Promise<ZodSafeParseResult<ZodSelectCourseType>> {
  const { user } = await requireAdmin();
  if (!user || user.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  if (!id) {
    throw new Error('Course ID is required');
  }

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, id));

  if (!course) {
    throw new Error('Course not found');
  }

  const { error, data, success } = ZodCourseSelectSchema.safeParse(course);
  if (!success) {
    throw new Error(`Invalid course data: ${error.message}`);
  }

  return { success, data };
}
/**
 * Create or update course
 */
export async function adminUpsertCourse(formData: FormData) {
  const { user } = await requireAdmin();
  if (!user || user.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

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
      errors: validatedFields.error.flatten().fieldErrors,
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
          message: `Failed to delete old image: ${err.message}`,
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
        message: `Upload failed: ${uploadError.message}`,
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

  try {
    const data = await db.transaction(async (tx) => {
      const [upsertedData] = await tx
        .insert(coursesTable)
        .values(finalValues)
        .onConflictDoUpdate({
          target: coursesTable.id,
          set: finalValues,
        })
        .returning();
      return upsertedData;
    });

    revalidatePath('/admin/courses');
    return {
      data,
      success: true,
      message: finalValues.id
        ? 'Course updated successfully'
        : 'Course created successfully',
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: e.message,
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
  // export async function adminUpsertCourse(input: CourseFormInput) {
  const { user } = await requireAdmin();
  if (!user || user.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }
  if (!input.id) {
    throw new Error('course is is missing');
  }
  if (!input.category_id) {
    throw new Error('category id is missing');
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
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath('/admin/courses');

  return {
    data,
    success: true,
    message: input.id
      ? 'Course updated successfully'
      : 'Course created successfully',
  };
}
/**
 * Delete course by ID
 */
export async function adminDeleteCourse(id: string) {
  const client = await createServerSupabaseClient();

  const { error } = await client.from('courses').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/courses');
}

export const getCachedAdminGetCourses = cache(adminGetCourses);
export const getCachedAdminAllCourses = cache(adminGetAllCourses);
export const getCachedAdminCourseById = cache(adminGetCourseById);
