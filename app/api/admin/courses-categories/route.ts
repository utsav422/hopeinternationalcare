import type { ColumnFilter } from '@tanstack/react-table';
import { type AnyColumn, asc, desc, eq, type SQL, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db/drizzle';
import { courseCategories as courseCategoriesTable } from '@/lib/db/schema/course-categories';
import { requireAdmin } from '@/utils/auth-guard';
import { isValidTableColumnName } from '@/utils/utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const getAll = searchParams.get('getAll');

  if (id) {
    try {
      await requireAdmin();
      const [category] = await db
        .select()
        .from(courseCategoriesTable)
        .where(eq(courseCategoriesTable.id, id));

      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Course not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: category });
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
          id: courseCategoriesTable.id,
          name: courseCategoriesTable.name,
          description: courseCategoriesTable.description,
          created_at: courseCategoriesTable.created_at,
        })
        .from(courseCategoriesTable)
        .orderBy(desc(courseCategoriesTable.created_at));

      return NextResponse.json({ success: true, data });
    } catch (_error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch all categories' },
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

    const baseQuery = db
      .select(selectColumns)
      .from(courseCategoriesTable)
      .where(whereClause);

    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(courseCategoriesTable)
      .where(whereClause);

    const [data, [{ count }]] = await Promise.all([
      baseQuery.limit(pageSize).offset(offset).orderBy(sort),
      countQuery,
    ]);

    return NextResponse.json({
      success: true,
      data,
      total: count ?? 0,
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
