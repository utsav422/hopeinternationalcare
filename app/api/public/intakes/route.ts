import { and, eq, gte, lte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses } from '@/lib/db/schema/courses';
import { intakes } from '@/lib/db/schema/intakes';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get('courseId');
  const intakeId = searchParams.get('intakeId');
  const upcoming = searchParams.get('upcoming');
  const all = searchParams.get('all');
  const slug = searchParams.get('slug');

  if (courseId) {
    return await getActiveIntakesByCourseId(courseId);
  }

  if (intakeId) {
    return await getIntakeById(intakeId);
  }

  if (upcoming) {
    return await getUpcomingIntakes();
  }

  if (all) {
    return await getAllIntakes();
  }

  if (slug) {
    return await getCourseIntakesBySlug(slug);
  }

  return NextResponse.json(
    { success: false, error: 'Invalid request' },
    { status: 400 }
  );
}

async function getActiveIntakesByCourseId(courseId: string) {
  try {
    const today = new Date().toISOString();
    const courseIntakes = await db.query.intakes.findMany({
      where: and(
        eq(intakes.course_id, courseId),
        gte(intakes.start_date, today),
        eq(intakes.is_open, true)
      ),
      orderBy: (intakes, { asc }) => [asc(intakes.start_date)],
    });
    return NextResponse.json({ success: true, data: courseIntakes });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch course intakes: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

async function getIntakeById(intakeId: string) {
  try {
    const [data] = await db
      .select()
      .from(intakes)
      .where(eq(intakes.id, intakeId))
      .limit(1);

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch course intakes: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

async function getUpcomingIntakes() {
  try {
    const today = new Date().toISOString();
    const upcomingIntakes = await db
      .select({
        intakeId: intakes.id,
        courseTitle: courses.title,
        startDate: intakes.start_date,
        capacity: intakes.capacity,
        totalRegistered: intakes.total_registered,
      })
      .from(intakes)
      .leftJoin(courses, eq(intakes.course_id, courses.id))
      .where(and(gte(intakes.start_date, today), eq(intakes.is_open, true)))
      .orderBy(intakes.start_date)
      .limit(5);

    logger.debug('Upcoming Intakes:', { count: upcomingIntakes.length });

    return NextResponse.json({ success: true, data: upcomingIntakes });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to fetch upcoming intakes.';
    logger.error('Error fetching upcoming intakes', {
      error: errorMessage,
    });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

async function getAllIntakes() {
  try {
    const today = new Date().toISOString();
    const allIntakes = await db.query.intakes.findMany({
      where: and(gte(intakes.start_date, today), eq(intakes.is_open, true)),
      orderBy: (intakes, { asc }) => [asc(intakes.start_date)],
    });
    return NextResponse.json({ success: true, data: allIntakes });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Failed to fetch all intakes: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function getCourseIntakesBySlug(slug: string) {
  try {
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1).toISOString();
    const endDate = new Date(
      currentYear,
      11,
      31,
      23,
      59,
      59,
      999
    ).toISOString();

    const courseIntakes = await db
      .select({
        id: intakes.id,
        start_date: intakes.start_date,
        end_date: intakes.end_date,
        is_open: intakes.is_open,
        capacity: intakes.capacity,
        total_registered: intakes.total_registered,
        course_id: intakes.course_id,
        created_at: intakes.created_at,
      })
      .from(intakes)
      .leftJoin(courses, eq(intakes.course_id, courses.id))
      .where(
        and(
          eq(courses.slug, slug),
          gte(intakes.start_date, startDate),
          lte(intakes.start_date, endDate)
        )
      );

    return NextResponse.json({ success: true, data: courseIntakes });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch intakes for course ${slug}: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
