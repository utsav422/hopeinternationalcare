import type { InferSelectModel } from 'drizzle-orm';
import type { intakes } from '@/lib/db/schema/intakes';
import type { CourseBase } from '@/lib/types/courses';

// Base types
export type IntakeBase = InferSelectModel<typeof intakes>;

// Public intake list item
export interface PublicIntakeListItem {
  intakeId: string;
  courseTitle: string;
  startDate: string;
  capacity: number;
  totalRegistered: number;
}

// Public intake detail
export interface PublicIntakeDetail {
  id: string;
  start_date: string;
  end_date: string;
  is_open: boolean;
  capacity: number;
  total_registered: number;
  course_id: string;
  created_at: string;
}

// Active intakes by course
export interface ActiveIntake {
  id: string;
  start_date: string;
  end_date: string;
  is_open: boolean;
  capacity: number;
  total_registered: number;
  course_id: string;
  created_at: string;
}

// Upcoming intakes
export interface UpcomingIntake {
  intakeId: string;
  courseTitle: string;
  startDate: string;
  capacity: number;
  totalRegistered: number;
}

// Course intakes by slug
export interface CourseIntakeBySlug {
  id: string;
  start_date: string;
  end_date: string;
  is_open: boolean;
  capacity: number;
  total_registered: number;
  course_id: string;
  created_at: string;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, any>;
}