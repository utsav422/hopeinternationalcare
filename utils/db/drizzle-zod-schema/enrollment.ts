import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { enrollments } from '@/utils/db/schema/enrollments';
// import type { ZodSelectCourseType } from './courses';
// import type { ZodSelectIntakeType } from './intakes';
// import type { ZodSelectProfileType } from './profiles';

export const ZodEnrollmentInsertSchema = createInsertSchema(enrollments);
export const ZodEnrollmentSelectSchema = createSelectSchema(enrollments);

export type ZodInsertEnrollmentType =
  typeof ZodEnrollmentInsertSchema._zod.input;
export type ZodSelectEnrollmentType =
  typeof ZodEnrollmentSelectSchema._zod.input;

export type CustomEnrollmentsAndOthers = {
  id: string;
  status: 'requested' | 'enrolled' | 'cancelled';
  enrollment_date: string | null;
  payment_id: string | null;
  created_at: string;
  intake_id: string | null;
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  coursePrice: number;
  courseTitle: string | null;
  start_date: string | null;
  start_end: string | null;
  notes: string | null;
  cancelled_reason: string | null;
};
export type CustomEnrollmentDetailsType = {
  id: string;
  status: 'requested' | 'enrolled' | 'cancelled';
  enrollment_date: string | null;
  cancelled_reason: string | null;
  notes: string | null;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string | null;
  } | null;
  intake: {
    id: string;
    start_date: string;
    end_date: string;
    capacity: number;
  } | null;
  course: {
    id: string;
    title: string;
    description: string | null;
    duration_type: 'days' | 'week' | 'month' | 'year';
    duration_value: number;
    price: number; // Add price here
  } | null;
};
