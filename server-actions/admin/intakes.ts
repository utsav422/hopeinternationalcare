'use server';

import type { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
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
import { requireAdmin } from '@/utils/auth-guard';
import { db } from '@/utils/db/drizzle';
import { courses as coursesTable } from '@/utils/db/schema/courses';
import { intakes as intakesTable } from '@/utils/db/schema/intakes';
import { isValidTableColumnName } from '@/utils/utils';
import { DurationType } from './../../utils/db/schema/enums';

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
export type ListParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: string;
  filters?: ColumnFiltersState;
};

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
    data: data as IntakeWithCourse[],
    total: count ?? 0,
  };
}

export async function adminGetAllActiveIntake() {
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
      gte(sql`EXTRACT(YEAR FROM ${intakesTable.start_date})::int`, currentYear)
    )
    .orderBy(desc(intakesTable.created_at));

  return {
    data: data as IntakeWithCourse[],
  };
}
/**
 * Get all intakes
 */
export async function adminGetAllIntake() {
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
    data: data as IntakeWithCourse[],
  };
}
/**
 * Get single intake by ID with course info
 */
export async function adminGetIntakeById(id: string) {
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
}

/**
 * Create or update an intake
 */
export async function adminUpsertIntake(
  input: typeof intakesTable.$inferInsert
) {
  const user = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  if (input.id) {
    await db
      .update(intakesTable)
      .set(input)
      .where(eq(intakesTable.id, input.id));
  } else {
    await db.insert(intakesTable).values(input);
  }

  revalidatePath('/admin/intakes');
}

/**
 * Delete an intake by ID
 */
export async function adminDeleteIntake(id: string) {
  const user = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  await db.delete(intakesTable).where(eq(intakesTable.id, id));
  revalidatePath('/admin/intakes');
}

export async function generateIntakesForCourse(courseId: string) {
  const user = await requireAdmin();

  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId));

  if (!course) {
    throw new Error('Course not found');
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

  await db.insert(intakesTable).values(intakes);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function generateIntakesForCourseAdvanced(courseId: string) {
  const user = await requireAdmin();
  if (!user || user?.user_metadata?.role !== 'service_role') {
    throw new Error('Unauthorized');
  }

  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, courseId));

  if (!course) {
    throw new Error('Course not found');
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
    const startDate = new Date(currentYear, Math.floor(i * monthsPerIntake), 1);
    const intakeExists = existingIntakes.some(
      (intake) => new Date(intake.start_date).getTime() === startDate.getTime()
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

  if (newIntakes.length > 0) {
    await db.insert(intakesTable).values(newIntakes);
  }

  revalidatePath(`/admin/courses/${courseId}`);
}

export const getCachedAdminIntakes = cache(adminGetIntakes);
export const getCachedAdminAllIntake = cache(adminGetAllIntake);
export const getCachedAdminIntakeById = cache(adminGetIntakeById);
export const getCachedAdminGetAllActiveIntake = cache(adminGetAllActiveIntake);
