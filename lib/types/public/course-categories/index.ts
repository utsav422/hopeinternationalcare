import type { InferSelectModel } from 'drizzle-orm';
import type { courseCategories } from '@/lib/db/schema/course-categories';

// Base types
export type CourseCategoryBase = InferSelectModel<typeof courseCategories>;

// Public course category list item
export interface PublicCourseCategoryListItem {
  id: string;
  name: string;
  description: string | null;
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