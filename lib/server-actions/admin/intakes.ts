'use server';

import type { ColumnFilter } from '@tanstack/react-table';
import {
  type AnyColumn,
  asc,
  desc,
  eq,
  gte,
  inArray,
  type SQL,
  sql,
} from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import type { ListParams as DataTableListParams } from '@/hooks/admin/use-data-table-query-state';
import { db } from '@/lib/db/drizzle';
import { courses as coursesTable } from '@/lib/db/schema/courses';
import { intakes as intakesTable } from '@/lib/db/schema/intakes';
import { requireAdmin } from '@/utils/auth-guard';
import { isValidTableColumnName } from '@/utils/utils';
import { DurationType } from '../../db/schema/enums';

export type IntakeWithCourse = {
  id: string;
  course_id: string | null;
  coursePrice: number;
  courseTitle: string | null;
  start_date: string;
  end_date: string;
  capacity: number;
  total_registered: number;
  is_open: boolean | null;
  created_at: string;
};
export type ListParams = Partial<DataTableListParams>;

/**
 * Get paginated list of intakes with optional search by course title
 */
export async function adminGetIntakes({
  page = 1,
  pageSize = 10,
  sortBy = 'created_at',
  order = 'desc',
  filters = [],
}: ListParams) {
  try {
    const offset = (page - 1) * pageSize;

    const selectColumns = {
      id: intakesTable.id,
      course_id: intakesTable.course_id,
      total_registered: intakesTable.total_registered,
      courseTitle: coursesTable.title,
      coursePrice: coursesTable.price, // Added coursePrice
      start_date: intakesTable.start_date,
      end_date: intakesTable.end_date,
      capacity: intakesTable.capacity,
      is_open: intakesTable.is_open,
      created_at: intakesTable.created_at,
    };

    const columnMap: Record<string, AnyColumn> = {
      id: intakesTable.id,
      course_id: intakesTable.course_id,
      courseTitle: coursesTable.title,
      coursePrice: coursesTable.price, // Added coursePrice
      start_date: intakesTable.start_date,
      end_date: intakesTable.end_date,
      capacity: intakesTable.capacity,
      is_open: intakesTable.is_open,
      created_at: intakesTable.created_at,
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
        return null;
      })
      .filter(Boolean);
    const whereClause =
      filterConditions?.length > 0
        ? sql.join(filterConditions as SQL<unknown>[], sql` AND `)
        : undefined;

    const sortColumn: AnyColumn = isValidTableColumnName(sortBy, intakesTable)
      ? (intakesTable[sortBy] as AnyColumn)
      : intakesTable.created_at;

    const sort = order === 'asc' ? asc(sortColumn) : desc(sortColumn);
    const baseQuery = db
      .select(selectColumns)
      .from(intakesTable)
      .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
      .where(whereClause)
      .orderBy(sort)
      .limit(pageSize)
      .offset(offset);

    const [data, [{ count }]] = await Promise.all([
      baseQuery,
      db
        .select({ count: sql<number>`count(*)` })
        .from(intakesTable)
        .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
        .where(whereClause),
    ]);

    return {
      success: true,
      data: data as IntakeWithCourse[],
      total: count ?? 0,
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function adminGetAllActiveIntake() {
  try {
    const currentYear = new Date().getFullYear();

    const data = await db
      .select({
        id: intakesTable.id,
        course_id: intakesTable.course_id,
        courseTitle: coursesTable.title,
        coursePrice: coursesTable.price,
        start_date: intakesTable.start_date,
        end_date: intakesTable.end_date,
        capacity: intakesTable.capacity,
        is_open: intakesTable.is_open,
        created_at: intakesTable.created_at,
      })
      .from(intakesTable)
      .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
      .where(
        gte(
          sql`EXTRACT(YEAR FROM ${intakesTable.start_date})::int`,
          currentYear
        )
      )
      .orderBy(desc(intakesTable.created_at));

    return {
      success: true,
      data: data as IntakeWithCourse[],
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
/**
 * Get all intakes
 */
export async function adminGetAllIntake() {
  try {
    const data = await db
      .select({
        id: intakesTable.id,
        course_id: intakesTable.course_id,
        courseTitle: coursesTable.title,
        coursePrice: coursesTable.price,
        start_date: intakesTable.start_date,
        end_date: intakesTable.end_date,
        capacity: intakesTable.capacity,
        is_open: intakesTable.is_open,
        created_at: intakesTable.created_at,
      })
      .from(intakesTable)
      .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
      .orderBy(desc(intakesTable.created_at));

    return {
      success: true,
      data: data as IntakeWithCourse[],
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}
/**
 * Get single intake by ID with course info
 */
export async function adminGetIntakeById(id: string) {
  try {
    const [data] = await db
      .select()
      .from(intakesTable)
      .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
      .where(eq(intakesTable.id, id))
      .limit(1);

    return {
      success: true,
      data: {
        ...data?.intakes,
        course: data?.courses ? { ...data.courses } : undefined,
      },
    };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

/**
 * Create or update an intake
 */
export async function adminUpsertIntake(
  input: typeof intakesTable.$inferInsert
) {
  try {
    await requireAdmin();

    let data: (typeof intakesTable.$inferSelect)[];
    if (input.id) {
      data = await db
        .update(intakesTable)
        .set(input)
        .where(eq(intakesTable.id, input.id))
        .returning();
    } else {
      data = await db.insert(intakesTable).values(input).returning();
    }

    revalidatePath('/admin/intakes');
    return { success: true, data: data[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

/**
 * Delete an intake by ID
 */
export async function adminDeleteIntake(id: string) {
  try {
    await requireAdmin();

    const data = await db
      .delete(intakesTable)
      .where(eq(intakesTable.id, id))
      .returning();
    revalidatePath('/admin/intakes');
    return { success: true, data: data[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function generateIntakesForCourse(courseId: string) {
  try {
    await requireAdmin();

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId));

    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    const intakes: (typeof intakesTable.$inferInsert)[] = [];
    for (let i = 0; i < 3; i++) {
      const startDate = new Date(currentYear, i * 4, 1);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + course.duration_value);

      intakes.push({
        id: crypto.randomUUID(),
        course_id: courseId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        capacity: 20,
        is_open: true,
      });
    }

    const data = await db.insert(intakesTable).values(intakes).returning();
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true, data };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function generateIntakesForCourseAdvanced(courseId: string) {
  try {
    await requireAdmin();

    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, courseId));

    if (!course) {
      return { success: false, error: 'Course not found' };
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const { duration_value, duration_type } = course;

    let monthsPerIntake = 0;
    switch (duration_type) {
      case DurationType.days:
        monthsPerIntake = duration_value / 30;
        break;
      case DurationType.week:
        monthsPerIntake = duration_value / 4;
        break;
      case DurationType.month:
        monthsPerIntake = duration_value;
        break;
      case DurationType.year:
        monthsPerIntake = duration_value * 12;
        break;
      default:
        break;
    }

    const numIntakes =
      monthsPerIntake < 1 ? 12 : Math.floor(12 / monthsPerIntake);

    const existingIntakes = await db
      .select()
      .from(intakesTable)
      .where(eq(intakesTable.course_id, courseId));

    const newIntakes: (typeof intakesTable.$inferInsert)[] = [];
    for (let i = 0; i < numIntakes; i++) {
      const startDate = new Date(
        currentYear,
        Math.floor(i * monthsPerIntake),
        1
      );
      const intakeExists = existingIntakes.some(
        (intake) =>
          new Date(intake.start_date).getTime() === startDate.getTime()
      );

      if (!intakeExists) {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + monthsPerIntake);
        newIntakes.push({
          course_id: courseId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          capacity: 20,
          is_open: true,
        });
      }
    }

    let data: (typeof intakesTable.$inferSelect)[] | null = null;
    if (newIntakes.length > 0) {
      data = await db.insert(intakesTable).values(newIntakes).returning();
    }

    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true, data };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export const getCachedAdminIntakes = cache(adminGetIntakes);
export const getCachedAdminAllIntake = cache(adminGetAllIntake);
export const getCachedAdminIntakeById = cache(adminGetIntakeById);
export const getCachedAdminGetAllActiveIntake = cache(adminGetAllActiveIntake);
