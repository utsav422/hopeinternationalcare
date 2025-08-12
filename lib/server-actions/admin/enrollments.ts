'use server';

import type { ColumnFilter, ColumnFiltersState } from '@tanstack/react-table';
import {
  type AnyColumn,
  eq,
  gte,
  inArray,
  lte,
  type SQL,
  sql,
} from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';
import { courseCategories as categoriesSchema } from '@/lib/db/schema/course-categories';
import { courses as courseSchema } from '@/lib/db/schema/courses';
import { enrollments as enrollmentSchema } from '@/lib/db/schema/enrollments';
import type {
  TypeEnrollmentStatus,
  TypePaymentStatus,
} from '@/lib/db/schema/enums'; // Import enums
import { intakes as intakeSchema } from '@/lib/db/schema/intakes';
import { payments as paymentSchema } from '@/lib/db/schema/payments';
import { profiles as profileSchema } from '@/lib/db/schema/profiles';

export async function adminGetEnrollments(params: {
  page?: number;
  pageSize?: number;
  filters?: ColumnFiltersState;
}) {
  try {
    const { page = 1, pageSize = 10, filters = [] } = params;
    const offset = (page - 1) * pageSize;
    const columnMap: Record<string, AnyColumn> = {
      id: enrollmentSchema.id,
      payment_id: paymentSchema.id,
      status: enrollmentSchema.status,
      created_at: enrollmentSchema.created_at,
      intake_id: enrollmentSchema.intake_id,
      user_id: enrollmentSchema.user_id,
      fullName: profileSchema.full_name,
      email: profileSchema.email,
      courseTitle: courseSchema.title,
      start_date: intakeSchema.start_date,
      notes: enrollmentSchema.notes,
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
          // For array filters, create a combined tsquery
          return inArray(col, filter.value);
        }
        // Handle numeric range filters [min, max]
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
        // Handle single numeric value filters (e.g., exact match)
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

    const data = await db
      .select({
        id: enrollmentSchema.id,
        notes: enrollmentSchema.notes,
        status: enrollmentSchema.status,
        created_at: enrollmentSchema.created_at,
        intake_id: enrollmentSchema.intake_id,
        user_id: enrollmentSchema.user_id,
        price: courseSchema.price,
        payment_id: paymentSchema.id,
        fullName: profileSchema.full_name,
        email: profileSchema.email,
        courseTitle: courseSchema.title,
        start_date: intakeSchema.start_date,
      })
      .from(enrollmentSchema)
      .where(whereClause)
      .leftJoin(
        paymentSchema,
        eq(paymentSchema.enrollment_id, enrollmentSchema.id)
      )
      .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
      .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
      .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id))
      .offset(offset)
      .limit(pageSize);

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollmentSchema)
      .where(whereClause);

    return { success: true, data, total: total[0].count };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function adminGetEnrollmentById(id: string) {
  try {
    const data = await db
      .select({
        id: enrollmentSchema.id,
        status: enrollmentSchema.status,
        created_at: enrollmentSchema.created_at,
        intake_id: enrollmentSchema.intake_id,
        user_id: enrollmentSchema.user_id,
        cancelled_reason: enrollmentSchema.cancelled_reason,
        enrollment_data: enrollmentSchema.enrollment_date,
        fullName: profileSchema.full_name,
        email: profileSchema.email,
        courseTitle: courseSchema.title,
        courseDescription: courseSchema.description,
        duration_type: courseSchema.duration_type,
        duration_value: courseSchema.duration_value,
        start_date: intakeSchema.start_date,
        end_date: intakeSchema.end_date,
        notes: enrollmentSchema.notes,
      })
      .from(enrollmentSchema)
      .where(eq(enrollmentSchema.id, id))
      .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
      .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
      .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

    return { success: true, data: data[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function adminGetEnrollmentWithDetails(id: string) {
  try {
    const result = await db
      .select()
      .from(enrollmentSchema)
      .where(eq(enrollmentSchema.id, id))
      .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
      .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
      .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));
    return { success: true, data: result[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function adminGetEnrollmentsByUserId(userId: string) {
  try {
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

    return { success: true, data, total: total[0].count };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function adminGetEnrollmentWithPayment(id: string) {
  try {
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

    return { success: true, data: data[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function adminUpsertEnrollment(
  enrollmentData: ZodEnrollmentInsertType
) {
  try {
    let data: (typeof enrollmentSchema.$inferSelect)[];
    if (enrollmentData.id) {
      data = await db
        .update(enrollmentSchema)
        .set(enrollmentData)
        .where(eq(enrollmentSchema.id, enrollmentData.id))
        .returning();
    } else {
      const newEnrollment = await db
        .insert(enrollmentSchema)
        .values(enrollmentData)
        .returning();
      data = newEnrollment;

      if (newEnrollment[0].id) {
        // Fetch course price based on intake_id
        const intakeDetails = await db
          .select({ course_id: intakeSchema.course_id })
          .from(intakeSchema)
          .where(eq(intakeSchema.id, newEnrollment[0].intake_id as string));

        if (intakeDetails.length > 0) {
          const courseDetails = await db
            .select({ price: courseSchema.price })
            .from(courseSchema)
            .where(eq(courseSchema.id, intakeDetails[0].course_id as string));

          if (courseDetails.length > 0) {
            const paymentAmount = courseDetails[0].price;
            await db.insert(paymentSchema).values({
              enrollment_id: newEnrollment[0].id,
              amount: paymentAmount,
              status: 'pending',
              method: 'cash',
            });
          }
        }
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
    return { success: true, data: data[0] };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function adminUpdateEnrollmentStatus(
  id: string,
  status: TypeEnrollmentStatus,
  cancelled_reason?: string
) {
  try {
    const data = await db
      .update(enrollmentSchema)
      .set({ status, notes: cancelled_reason })
      .where(eq(enrollmentSchema.id, id))
      .returning();

    // Fetch the enrollment to get the associated payment
    const enrollmentWithPayment = await db
      .select({
        paymentId: paymentSchema.id,
        enrollmentStatus: enrollmentSchema.status,
      })
      .from(enrollmentSchema)
      .leftJoin(
        paymentSchema,
        eq(paymentSchema.enrollment_id, enrollmentSchema.id)
      )
      .where(eq(enrollmentSchema.id, id));

    if (
      enrollmentWithPayment.length > 0 &&
      enrollmentWithPayment[0].paymentId
    ) {
      let newPaymentStatus: TypePaymentStatus | undefined;

      if (status === 'enrolled' || status === 'completed') {
        newPaymentStatus = 'completed';
      } else if (status === 'cancelled') {
        newPaymentStatus = 'cancelled';
      }

      if (newPaymentStatus) {
        await db
          .update(paymentSchema)
          .set({ status: newPaymentStatus })
          .where(eq(paymentSchema.id, enrollmentWithPayment[0].paymentId));
      }
    }

    revalidatePath('/admin/enrollments');
    return {
      success: true,
      data: data[0],
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while updating enrollment status.',
    };
  }
}

export async function adminGetAllEnrollments() {
  try {
    const data = await db
      .select({
        enrollment: enrollmentSchema,
        user: profileSchema,
        intake: intakeSchema,
        course: courseSchema,
        category: categoriesSchema,
      })
      .from(enrollmentSchema)
      .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
      .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
      .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id))
      .leftJoin(
        categoriesSchema,
        eq(courseSchema.category_id, categoriesSchema.id)
      );
    return { success: true, data };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function adminGetAllEnrollmentsByStatus(
  status: TypeEnrollmentStatus
) {
  try {
    const data = await db
      .select()
      .from(enrollmentSchema)
      .where(eq(enrollmentSchema.status, status));
    return { success: true, data };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export async function adminDeleteEnrollment(id: string) {
  try {
    const enrollment = await db
      .select()
      .from(enrollmentSchema)
      .where(eq(enrollmentSchema.id, id));

    const data = await db
      .delete(enrollmentSchema)
      .where(eq(enrollmentSchema.id, id))
      .returning();

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
    return { success: true, data: data[0] };
  } catch (error) {
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

export const getCachedAdminEnrollments = cache(adminGetEnrollments);
export const getCachedAdminEnrollmentById = cache(adminGetEnrollmentById);
export const getCachedAdminEnrollmentWithDetails = cache(
  adminGetEnrollmentWithDetails
);
export const getCachedAdminEnrollmentsByUserId = cache(
  adminGetEnrollmentsByUserId
);
export const getCachedAdminEnrollmentWithPayment = cache(
  adminGetEnrollmentWithPayment
);

export const getCachedAdminAllEnrollments = cache(adminGetAllEnrollments);
export const getCachedAdminAllEnrollmentsByStatus = cache(
  adminGetAllEnrollmentsByStatus
);
