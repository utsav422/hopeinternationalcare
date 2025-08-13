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
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses as coursesTable } from '@/lib/db/schema/courses';
import { intakes as intakesTable } from '@/lib/db/schema/intakes';
import { isValidTableColumnName } from '@/utils/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const getAll = searchParams.get('getAll');
  const getAllActive = searchParams.get('getAllActive');

  if (id) {
    try {
      const [data] = await db
        .select()
        .from(intakesTable)
        .leftJoin(coursesTable, eq(intakesTable.course_id, coursesTable.id))
        .where(eq(intakesTable.id, id))
        .limit(1);

      return NextResponse.json({
        success: true,
        data: {
          ...data?.intakes,
          course: data?.courses ? { ...data.courses } : undefined,
        },
      });
    } catch (error) {
      const e = error as Error;
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }
  }

  if (getAll) {
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

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error) {
      const e = error as Error;
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }
  }

  if (getAllActive) {
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

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (error) {
      const e = error as Error;
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }
  }

  const page = Number.parseInt(searchParams.get('page') || '1', 10);
  const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10);
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const filters = searchParams.get('filters')
    ? (JSON.parse(searchParams.get('filters') as string) as ColumnFilter[])
    : [];

  try {
    const offset = (page - 1) * pageSize;

    const selectColumns = {
      id: intakesTable.id,
      course_id: intakesTable.course_id,
      total_registered: intakesTable.total_registered,
      courseTitle: coursesTable.title,
      coursePrice: coursesTable.price,
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
      coursePrice: coursesTable.price,
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

    return NextResponse.json({
      success: true,
      data,
      total: count ?? 0,
    });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
