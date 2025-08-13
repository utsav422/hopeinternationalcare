import type { ColumnFilter } from '@tanstack/react-table';
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
import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db/drizzle';
import { courseCategories } from '@/lib/db/schema/course-categories';
import { courses as coursesTable } from '@/lib/db/schema/courses';
import { requireAdmin } from '@/utils/auth-guard';
import { isValidTableColumnName } from '@/utils/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const getAll = searchParams.get('getAll');

  if (id) {
    try {
      await requireAdmin();
      const [course] = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.id, id));

      if (!course) {
        return NextResponse.json(
          { success: false, error: 'Course not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: course });
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

      return NextResponse.json({
        success: true,
        data,
      });
    } catch (_error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch all courses' },
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
          return inArray(col, filter.value);
        }
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

    return NextResponse.json({
      success: true,
      data,
      total: count ?? 0,
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
