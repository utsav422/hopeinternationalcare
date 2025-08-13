import { desc, eq, like, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db/drizzle';
import { profiles as profilesTable } from '@/lib/db/schema/profiles';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const getAll = searchParams.get('getAll');

  if (id) {
    try {
      const [data] = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.id, id));

      if (!data) {
        return NextResponse.json(
          { success: false, error: 'Profile not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data });
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
        .select()
        .from(profilesTable)
        .orderBy(desc(profilesTable.created_at))
        .where(eq(profilesTable.role, 'authenticated'));

      return NextResponse.json({ success: true, data });
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
  const search = searchParams.get('search') || '';

  try {
    const offset = (page - 1) * pageSize;

    let baseQuery = db.select().from(profilesTable).$dynamic();

    if (search) {
      baseQuery = baseQuery.where(like(profilesTable.full_name, `%${search}%`));
    }

    const data = await baseQuery
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(profilesTable.created_at));

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(profilesTable);

    return NextResponse.json({ success: true, data, total: count ?? 0 });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
