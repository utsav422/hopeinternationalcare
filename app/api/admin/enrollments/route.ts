import type { ColumnFiltersState } from '@tanstack/react-table';
import {
  type AnyColumn,
  eq,
  gte,
  inArray,
  lte,
  type SQL,
  sql,
} from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';

import { courseCategories as categoriesSchema } from '@/lib/db/schema/course-categories';
import { courses as courseSchema } from '@/lib/db/schema/courses';
import { enrollments as enrollmentSchema } from '@/lib/db/schema/enrollments';
import type { TypeEnrollmentStatus } from '@/lib/db/schema/enums';
import { intakes as intakeSchema } from '@/lib/db/schema/intakes';
import { payments as paymentSchema } from '@/lib/db/schema/payments';
import { profiles as profileSchema } from '@/lib/db/schema/profiles';

// Define types for the different response structures
// Define types for the different response structures
type EnrollmentWithDetailsType = {
  enrollments: typeof enrollmentSchema.$inferSelect;
  profiles: typeof profileSchema.$inferSelect | null;
  intakes: typeof intakeSchema.$inferSelect | null;
  courses: typeof courseSchema.$inferSelect | null;
} | null;

type EnrollmentWithPaymentType = {
  enrollment: {
    id: string;
    status: TypeEnrollmentStatus;
    created_at: string;
    intake_id: string | null;
    user_id: string | null;
  };
  user: {
    id: string;
    fullName: string | null;
    email: string | null;
  } | null;
  course: {
    id: string;
    title: string | null;
    price: number | null;
  } | null;
  intake: {
    id: string;
    start_date: string | null;
    end_date: string | null;
    capacity: number | null;
  } | null;
  payment: {
    id: string;
    amount: number | null;
    status: import('@/lib/db/schema/enums').TypePaymentStatus | null;
    created_at: string | null;
  } | null;
} | null;

type EnrollmentWithBasicInfoType = {
  id: string;
  status: TypeEnrollmentStatus;
  created_at: string;
  intake_id: string | null;
  user_id: string | null;
  cancelled_reason: string | null;
  enrollment_data: string | null;
  fullName: string | null;
  email: string | null;
  courseTitle: string | null;
  courseDescription: string | null;
  duration_type: import('@/lib/db/schema/enums').TypeDurationType | null;
  duration_value: number | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
} | null;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');
  const status = searchParams.get('status') as TypeEnrollmentStatus | null;
  const withDetails = searchParams.get('withDetails');
  const withPayment = searchParams.get('withPayment');
  const getAll = searchParams.get('getAll');

  // Get by ID
  if (id) {
    try {
      let data:
        | EnrollmentWithDetailsType
        | EnrollmentWithPaymentType
        | EnrollmentWithBasicInfoType;
      if (withDetails) {
        const result = await db
          .select()
          .from(enrollmentSchema)
          .where(eq(enrollmentSchema.id, id))
          .leftJoin(
            profileSchema,
            eq(enrollmentSchema.user_id, profileSchema.id)
          )
          .leftJoin(
            intakeSchema,
            eq(enrollmentSchema.intake_id, intakeSchema.id)
          )
          .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));
        data = result[0] as EnrollmentWithDetailsType;
      } else if (withPayment) {
        const result = await db
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
          .leftJoin(
            profileSchema,
            eq(enrollmentSchema.user_id, profileSchema.id)
          )
          .leftJoin(
            intakeSchema,
            eq(enrollmentSchema.intake_id, intakeSchema.id)
          )
          .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));
        data = result[0] as EnrollmentWithPaymentType;
      } else {
        const result = await db
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
          .leftJoin(
            profileSchema,
            eq(enrollmentSchema.user_id, profileSchema.id)
          )
          .leftJoin(
            intakeSchema,
            eq(enrollmentSchema.intake_id, intakeSchema.id)
          )
          .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));
        data = result[0] as EnrollmentWithBasicInfoType;
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

  // Get by User ID
  if (userId) {
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

      return NextResponse.json({
        success: true,
        data,
        total: total[0].count,
      });
    } catch (error) {
      const e = error as Error;
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }
  }

  // Get All by Status
  if (status && getAll) {
    try {
      const data = await db
        .select()
        .from(enrollmentSchema)
        .where(eq(enrollmentSchema.status, status));
      return NextResponse.json({ success: true, data });
    } catch (error) {
      const e = error as Error;
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }
  }

  // Get All
  if (getAll) {
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
      return NextResponse.json({ success: true, data });
    } catch (error) {
      const e = error as Error;
      return NextResponse.json(
        { success: false, error: e.message },
        { status: 500 }
      );
    }
  }

  // Default: Paginated list
  try {
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Number.parseInt(searchParams.get('pageSize') || '10', 10);
    const filters = searchParams.get('filters')
      ? (JSON.parse(
          searchParams.get('filters') as string
        ) as ColumnFiltersState)
      : [];
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
      ?.map((filter) => {
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

    return NextResponse.json({ success: true, data, total: total[0].count });
  } catch (error) {
    const e = error as Error;
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
