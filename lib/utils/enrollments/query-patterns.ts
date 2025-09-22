import { enrollments } from '@/lib/db/schema/enrollments';
import { profiles } from '@/lib/db/schema/profiles';
import { intakes } from '@/lib/db/schema/intakes';
import { courses } from '@/lib/db/schema/courses';
import { payments } from '@/lib/db/schema/payments';

/**
 * Optimized column mappings for enrollment queries
 */
export const enrollmentColumnMap = {
  id: enrollments.id,
  status: enrollments.status,
  created_at: enrollments.created_at,
  intake_id: enrollments.intake_id,
  user_id: enrollments.user_id,
  notes: enrollments.notes,
  cancelled_reason: enrollments.cancelled_reason,
  enrollment_date: enrollments.enrollment_date,
  updated_at: enrollments.updated_at,
  user_name: profiles.full_name,
  user_email: profiles.email,
  course_title: courses.title,
  course_price: courses.price,
  course_duration_type: courses.duration_type,
  course_duration_value: courses.duration_value,
  intake_start_date: intakes.start_date,
  intake_end_date: intakes.end_date,
  intake_capacity: intakes.capacity,
  intake_registered: intakes.total_registered,
  payment_id: payments.id,
  payment_status: payments.status,
  payment_amount: payments.amount,
  payment_method: payments.method,
  payment_created_at: payments.created_at,
};

/**
 * Optimized select patterns for different enrollment query use cases
 */
export const enrollmentSelectPatterns = {
  // List view - minimal data for table display
  listView: {
    id: enrollments.id,
    status: enrollments.status,
    created_at: enrollments.created_at,
    notes: enrollments.notes,
    user: {
      id: profiles.id,
      fullName: profiles.full_name,
      email: profiles.email,
    },
    course: {
      id: courses.id,
      title: courses.title,
      price: courses.price,
    },
    intake: {
      id: intakes.id,
      start_date: intakes.start_date,
      end_date: intakes.end_date,
    },
    payment: {
      id: payments.id,
      status: payments.status,
      amount: payments.amount,
    },
  },
  
  // Detail view - comprehensive data for enrollment details page
  detailView: {
    enrollment: enrollments,
    user: profiles,
    intake: intakes,
    course: courses,
    payment: payments,
  },
  
  // Minimal view - only essential data
  minimalView: {
    id: enrollments.id,
    status: enrollments.status,
    created_at: enrollments.created_at,
    user_name: profiles.full_name,
    course_title: courses.title,
  }
};