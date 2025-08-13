import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courseCategories as courseCategoriesTable } from '@/lib/db/schema/course-categories';

export async function GET() {
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
