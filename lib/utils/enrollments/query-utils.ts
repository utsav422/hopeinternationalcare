import type { ColumnFiltersState } from '@tanstack/react-table';
import { asc, desc, sql, type AnyColumn, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { enrollments } from '@/lib/db/schema/enrollments';
import { profiles } from '@/lib/db/schema/profiles';
import { intakes } from '@/lib/db/schema/intakes';
import { courses } from '@/lib/db/schema/courses';
import { payments } from '@/lib/db/schema/payments';
import { enrollmentColumnMap } from './query-patterns';

/**
 * Builds an optimized enrollment list query with joins and filters
 */
export function buildEnrollmentListQuery(options: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  filters?: ColumnFiltersState;
}) {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'created_at',
    order = 'desc',
    filters = []
  } = options;

  const offset = (page - 1) * pageSize;

  // Start with base query
  let query = db
    .select({
      id: enrollments.id,
      status: enrollments.status,
      created_at: enrollments.created_at,
      notes: enrollments.notes,
      user_id: enrollments.user_id,
      intake_id: enrollments.intake_id,
      fullName: profiles.full_name,
      email: profiles.email,
      courseTitle: courses.title,
      price: courses.price,
      start_date: intakes.start_date,
      payment_id: payments.id,
      payment_status: payments.status,
      payment_amount: payments.amount,
    })
    .from(enrollments)
    .leftJoin(profiles, sql`${enrollments.user_id} = ${profiles.id}`)
    .leftJoin(intakes, sql`${enrollments.intake_id} = ${intakes.id}`)
    .leftJoin(courses, sql`${intakes.course_id} = ${courses.id}`)
    .leftJoin(payments, sql`${payments.enrollment_id} = ${enrollments.id}`);

  // Apply filters
  if (filters.length > 0) {
    // Build filter conditions
    const filterConditions = filters
      .map((filter) => {
        const col = enrollmentColumnMap[filter.id as keyof typeof enrollmentColumnMap];
        
        if (col && typeof filter.value === 'string' && filter.value) {
          // Text search using ILIKE for case-insensitive matching
          return sql`${col} ILIKE ${`%${filter.value}%`}`;
        }
        
        if (col && Array.isArray(filter.value) && filter.value.length > 0) {
          // For array filters, use IN clause
          return sql`${col} IN ${filter.value}`;
        }
        
        if (col && typeof filter.value === 'number') {
          // Handle single numeric value filters
          return sql`${col} = ${filter.value}`;
        }
        
        return null;
      })
      .filter(Boolean) as SQL<unknown>[];

    // Apply where clause if we have filter conditions
    if (filterConditions.length > 0) {
      const whereClause = filterConditions.reduce((acc, condition) =>
        acc ? sql`${acc} AND ${condition}` : condition
      );
      query = query.where(whereClause);
    }
  }

  // Apply sorting
  const sortColumn = enrollmentColumnMap[sortBy as keyof typeof enrollmentColumnMap] || enrollments.created_at;
  query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));

  // Apply pagination
  query = query.limit(pageSize).offset(offset);

  return query;
}

/**
 * Builds an optimized enrollment count query for pagination
 */
export function buildEnrollmentCountQuery(filters: ColumnFiltersState = []) {
  // Start with base count query
  let query = db
    .select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .leftJoin(profiles, sql`${enrollments.user_id} = ${profiles.id}`)
    .leftJoin(intakes, sql`${enrollments.intake_id} = ${intakes.id}`)
    .leftJoin(courses, sql`${intakes.course_id} = ${courses.id}`)
    .leftJoin(payments, sql`${payments.enrollment_id} = ${enrollments.id}`);

  // Apply filters if provided
  if (filters.length > 0) {
    // Build filter conditions
    const filterConditions = filters
      .map((filter) => {
        const col = enrollmentColumnMap[filter.id as keyof typeof enrollmentColumnMap];
        
        if (col && typeof filter.value === 'string' && filter.value) {
          return sql`${col} ILIKE ${`%${filter.value}%`}`;
        }
        
        if (col && Array.isArray(filter.value) && filter.value.length > 0) {
          return sql`${col} IN ${filter.value}`;
        }
        
        if (col && typeof filter.value === 'number') {
          return sql`${col} = ${filter.value}`;
        }
        
        return null;
      })
      .filter(Boolean) as SQL<unknown>[];

    // Apply where clause if we have filter conditions
    if (filterConditions.length > 0) {
      const whereClause = filterConditions.reduce((acc, condition) =>
        acc ? sql`${acc} AND ${condition}` : condition
      );
      query = query.where(whereClause);
    }
  }

  return query;
}

/**
 * Builds an optimized enrollment details query
 */
export function buildEnrollmentDetailsQuery(id: string) {
  return db
    .select({
      enrollment: enrollments,
      user: profiles,
      intake: intakes,
      course: courses,
      payment: payments,
    })
    .from(enrollments)
    .leftJoin(profiles, sql`${enrollments.user_id} = ${profiles.id}`)
    .leftJoin(intakes, sql`${enrollments.intake_id} = ${intakes.id}`)
    .leftJoin(courses, sql`${intakes.course_id} = ${courses.id}`)
    .leftJoin(payments, sql`${payments.enrollment_id} = ${enrollments.id}`)
    .where(sql`${enrollments.id} = ${id}`)
    .limit(1);
}