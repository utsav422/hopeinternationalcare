import type { InferSelectModel } from 'drizzle-orm';
import type { courseCategories } from '@/lib/db/schema/course-categories';
import type { intakes } from '@/lib/db/schema/intakes';
import type { CourseBase } from '@/lib/types/courses';
import type { TypeDurationType } from '@/lib/db/schema/enums';

// Base types
export type CourseCategoryBase = InferSelectModel<typeof courseCategories>;
export type IntakeBase = InferSelectModel<typeof intakes>;

// Public course list item
export interface PublicCourseListItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  level: number;
  duration_type: TypeDurationType;
  duration_value: number;
  created_at: string;
  updated_at: string;
  course_highlights: string | null;
  course_overview: string | null;
  image_url: string | null;
  categoryName: string | null;
  next_intake_date: string | null;
  next_intake_id: string | null;
  available_seats: number;
}

// Public course detail
export interface PublicCourseDetail {
  id: string;
  title: string;
  slug: string;
  price: number;
  level: number;
  duration_type: TypeDurationType;
  duration_value: number;
  created_at: string;
  course_highlights: string | null;
  course_overview: string | null;
  image_url: string | null;
  category_id: string | null;
  category: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  intakes: IntakeBase[];
}

// Public course category
export interface PublicCourseCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Public intake
export interface PublicIntake {
  id: string;
  start_date: string;
  end_date: string;
  is_open: boolean;
  capacity: number;
  total_registered: number;
  course_id: string;
  created_at: string;
}

// Query parameter types
export interface PublicCourseQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: {
    title?: string;
    category?: string;
    duration?: number;
    intake_date?: string;
  };
}

// Related courses
export interface RelatedCourse {
  id: string;
  title: string;
  slug: string;
  course_overview: string | null;
  course_highlights: string | null;
  image_url: string | null;
  price: number;
  categoryName: string | null;
  level: number;
  duration_value: number;
  duration_type: TypeDurationType;
}

// New courses
export interface NewCourse {
  id: string;
  title: string;
  slug: string;
  course_overview: string | null;
  course_highlights: string | null;
  level: number;
  duration_value: number;
  duration_type: TypeDurationType;
  image_url: string | null;
  price: number;
  next_intake_date: string | null;
  next_intake_id: string | null;
  available_seats: number;
  categoryName: string | null;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, any>;
}