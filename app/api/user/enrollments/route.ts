import { eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { courses as courseSchema } from '@/lib/db/schema/courses';
import { enrollments as enrollmentSchema } from '@/lib/db/schema/enrollments';
import { intakes as intakeSchema } from '@/lib/db/schema/intakes';
import { profiles as profileSchema } from '@/lib/db/schema/profiles';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated.' },
        { status: 401 }
      );
    }

    const data = await db
      .select({
        id: enrollmentSchema.id,
        status: enrollmentSchema.status,
        created_at: enrollmentSchema.created_at,
        intake_id: enrollmentSchema.intake_id,
        user_id: enrollmentSchema.user_id,
        courseTitle: courseSchema.title,
        courseDescription: courseSchema.description,
        courseImage: courseSchema.image_url,
        start_date: intakeSchema.start_date,
        end_date: intakeSchema.end_date,
        notes: enrollmentSchema.notes,
      })
      .from(enrollmentSchema)
      .where(eq(enrollmentSchema.user_id, user.id))
      .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
      .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
      .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollmentSchema)
      .where(eq(enrollmentSchema.user_id, user.id));

    return NextResponse.json({
      success: true,
      data: { data, total: total[0].count },
    });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
