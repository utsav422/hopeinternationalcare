'use server';

import { db } from '@/utils/db/drizzle';
import { intakes } from '@/utils/db/schema/intakes';
import { gte, and, eq } from 'drizzle-orm';

export async function getAllIntakes() {
  const today = new Date().toISOString();

  try {
    const allIntakes = await db.query.intakes.findMany({
      where: and(
        gte(intakes.start_date, today), // Only active and upcoming intakes
        eq(intakes.is_open, true) // Only open intakes
      ),
      orderBy: (intakes, { asc }) => [asc(intakes.start_date)],
    });
    return { data: allIntakes };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to fetch all intakes: ${errorMessage}` };
  }
}
