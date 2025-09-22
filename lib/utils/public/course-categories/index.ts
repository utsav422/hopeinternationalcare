import { db } from '@/lib/db/drizzle';
import { courseCategories } from '@/lib/db/schema/course-categories';
import { eq, sql } from 'drizzle-orm';

/**
 * Public course category validation utilities
 */

export class PublicCourseCategoryValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PublicCourseCategoryValidationError';
  }
}

/**
 * Validates course category ID
 * @param id - The category ID to validate
 * @throws PublicCourseCategoryValidationError if validation fails
 */
export function validateCategoryId(id: string): void {
  if (!id || typeof id !== 'string') {
    throw new PublicCourseCategoryValidationError(
      'Category ID is required and must be a string',
      'INVALID_CATEGORY_ID',
      { id }
    );
  }
}

/**
 * Public course category business logic utilities
 */

/**
 * Formats category name for display
 * @param name - The category name
 * @returns Formatted category name
 */
export function formatCategoryName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}