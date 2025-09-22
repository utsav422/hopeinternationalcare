import type { InferSelectModel } from 'drizzle-orm';
import type { enrollments } from '@/lib/db/schema/enrollments';
import type { intakes } from '@/lib/db/schema/intakes';
import type { profiles } from '@/lib/db/schema/profiles';
import type { CourseBase } from '@/lib/types/courses';

// Base types
export type EnrollmentBase = InferSelectModel<typeof enrollments>;
export type IntakeBase = InferSelectModel<typeof intakes>;
export type ProfileBase = InferSelectModel<typeof profiles>;

// User enrollment list item
export interface UserEnrollmentListItem {
  id: string;
  status: string;
  created_at: string;
  intake_id: string;
  user_id: string;
  courseTitle: string | null;
  course_highlights: string | null;
  course_overview: string | null;
  courseImage: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

export type { ApiResponse } from '../..';

// Enrollment creation data
export interface CreateEnrollmentData {
  courseId: string;
  intakeId: string;
  userId: string;
}

// User enrollment detail
export interface UserEnrollmentDetail {
  id: string;
  status: string;
  created_at: string;
  intake_id: string;
  user_id: string;
  courseTitle: string | null;
  course_highlights: string | null;
  course_overview: string | null;
  courseImage: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

