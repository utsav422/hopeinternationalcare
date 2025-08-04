// /server-actions/admin/enrollments.ts
'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/utils/db/drizzle';
import type { ZodInsertEnrollmentType } from '@/utils/db/drizzle-zod-schema/enrollment';
import type { ZodInsertPaymentType } from '@/utils/db/drizzle-zod-schema/payments';
import { courses as courseSchema } from '@/utils/db/schema/courses';
import { enrollments as enrollmentSchema } from '@/utils/db/schema/enrollments';
import { intakes as intakeSchema } from '@/utils/db/schema/intakes';
import { payments as paymentSchema } from '@/utils/db/schema/payments';
import { profiles as profileSchema } from '@/utils/db/schema/profiles';

export async function adminGetEnrollments(params: {
  page?: number;
  pageSize?: number;
  filters?: object;
}) {
  const { page = 1, pageSize = 10 } = params;
  const offset = (page - 1) * pageSize;

  const data = await db
    .select({
      id: enrollmentSchema.id,
      status: enrollmentSchema.status,
      created_at: enrollmentSchema.created_at,
      intake_id: enrollmentSchema.intake_id,
      user_id: enrollmentSchema.user_id,
      fullName: profileSchema.full_name,
      email: profileSchema.email,
      courseTitle: courseSchema.title,
      start_date: intakeSchema.start_date,
      notes: enrollmentSchema.notes,
    })
    .from(enrollmentSchema)
    .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
    .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
    .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id))
    .offset(offset)
    .limit(pageSize);

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollmentSchema);

  return { data, total: total[0].count };
}

export async function adminGetEnrollmentById(id: string) {
  const data = await db
    .select({
      id: enrollmentSchema.id,
      status: enrollmentSchema.status,
      created_at: enrollmentSchema.created_at,
      intake_id: enrollmentSchema.intake_id,
      user_id: enrollmentSchema.user_id,
      fullName: profileSchema.full_name,
      email: profileSchema.email,
      courseTitle: courseSchema.title,
      start_date: intakeSchema.start_date,
      notes: enrollmentSchema.notes,
    })
    .from(enrollmentSchema)
    .where(eq(enrollmentSchema.id, id))
    .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
    .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
    .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

  return { data: data[0] };
}

export async function adminGetEnrollmentWithDetails(id: string) {
  const result = await db
    .select()
    .from(enrollmentSchema)
    .where(eq(enrollmentSchema.id, id))
    .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
    .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
    .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));
  return result[0];
}

export async function adminGetEnrollmentsByUserId(userId: string) {
  const data = await db
    .select({
      id: enrollmentSchema.id,
      status: enrollmentSchema.status,
      created_at: enrollmentSchema.created_at,
      intake_id: enrollmentSchema.intake_id,
      user_id: enrollmentSchema.user_id,
      fullName: profileSchema.full_name,
      email: profileSchema.email,
      courseTitle: courseSchema.title,
      start_date: intakeSchema.start_date,
      notes: enrollmentSchema.notes,
    })
    .from(enrollmentSchema)
    .where(eq(enrollmentSchema.user_id, userId))
    .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
    .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
    .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollmentSchema)
    .where(eq(enrollmentSchema.user_id, userId));

  return { data, total: total[0].count };
}

export async function adminGetEnrollmentWithPayment(id: string) {
  const data = await db
    .select({
      enrollment: {
        id: enrollmentSchema.id,
        status: enrollmentSchema.status,
        created_at: enrollmentSchema.created_at,
        intake_id: enrollmentSchema.intake_id,
        user_id: enrollmentSchema.user_id,
      },
      user: {
        id: profileSchema.id,
        fullName: profileSchema.full_name,
        email: profileSchema.email,
      },
      course: {
        id: courseSchema.id,
        title: courseSchema.title,
        price: courseSchema.price,
      },
      intake: {
        id: intakeSchema.id,
        start_date: intakeSchema.start_date,
        end_date: intakeSchema.end_date,
        capacity: intakeSchema.capacity,
      },
      payment: {
        id: paymentSchema.id,
        amount: paymentSchema.amount,
        status: paymentSchema.status,
        created_at: paymentSchema.created_at,
      },
    })
    .from(enrollmentSchema)
    .where(eq(enrollmentSchema.id, id))
    .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
    .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
    .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

  return data[0];
}

export async function adminUpsertEnrollment(
  enrollmentData: ZodInsertEnrollmentType,
  paymentData: ZodInsertPaymentType
) {
  try {
    if (enrollmentData.id) {
      await db
        .update(enrollmentSchema)
        .set(enrollmentData)
        .where(eq(enrollmentSchema.id, enrollmentData.id));
    } else {
      const newEnrollment = await db
        .insert(enrollmentSchema)
        .values(enrollmentData)
        .returning();

      if (newEnrollment[0].id && paymentData) {
        paymentData.enrollment_id = newEnrollment[0].id;
        await db.insert(paymentSchema).values(paymentData);
      }

      // Increment total_registered in the intake
      if (enrollmentData.intake_id) {
        await db
          .update(intakeSchema)
          .set({
            total_registered: sql`${intakeSchema.total_registered} + 1`,
          })
          .where(eq(intakeSchema.id, enrollmentData.intake_id));
      }
    }

    revalidatePath('/admin/enrollments');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function adminUpdateEnrollmentStatus(
  id: string,
  status: TypeEnrollmentStatus,
  cancelled_reason?: string
) {
  await db
    .update(enrollmentSchema)
    .set({ status, notes: cancelled_reason })
    .where(eq(enrollmentSchema.id, id));
  revalidatePath('/admin/enrollments');
}

export async function adminGetAllEnrollments() {
  const data = await db.select().from(enrollmentSchema);
  return { data };
}

export async function adminGetAllEnrollmentsByStatus(status: TypeEnrollmentStatus) {
  const data = await db.select().from(enrollmentSchema).where(eq(enrollmentSchema.status, status));
  return { data };
}

export async function adminDeleteEnrollment(id: string) {
  const enrollment = await db
    .select()
    .from(enrollmentSchema)
    .where(eq(enrollmentSchema.id, id));

  await db.delete(enrollmentSchema).where(eq(enrollmentSchema.id, id));

  // Decrement total_registered in the intake
  if (enrollment[0].intake_id) {
    await db
      .update(intakeSchema)
      .set({
        total_registered: sql`${intakeSchema.total_registered} - 1`,
      })
      .where(eq(intakeSchema.id, enrollment[0].intake_id));
  }

  revalidatePath('/admin/enrollments');
}
