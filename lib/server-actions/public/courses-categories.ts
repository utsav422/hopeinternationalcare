'use server';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { courseCategories as courseCategoriesTable } from '@/lib/db/schema/course-categories';

/**
 * Get All list of courses catgories
 */
export async function publicGetAllCatogies() {
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
