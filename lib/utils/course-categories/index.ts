import { db } from '@/lib/db/drizzle';
import { courses } from '@/lib/db/schema/courses';
import { eq, sql } from 'drizzle-orm';
import { CourseCategoryCreateData, CourseCategoryUpdateData, CourseCategoryConstraintCheck } from '@/lib/types/course-categories';

/**
 * Course category validation utilities
 */

export class CourseCategoryValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CourseCategoryValidationError';
  }
}

/**
 * Validates course category name
 * @param name - The course category name to validate
 * @throws CourseCategoryValidationError if validation fails
 */
export function validateCategoryName(name: string): void {
  if (name.length < 3) {
    throw new CourseCategoryValidationError(
      'Name must be at least 3 characters long',
      'NAME_TOO_SHORT',
      { name, length: name.length }
    );
  }
  
  if (name.length > 255) {
    throw new CourseCategoryValidationError(
      'Name cannot exceed 255 characters',
      'NAME_TOO_LONG',
      { name, length: name.length }
    );
  }
}

/**
 * Validates course category data
 * @param data - The course category data to validate
 * @returns ValidationResult
 */
export function validateCourseCategoryData(data: CourseCategoryCreateData | CourseCategoryUpdateData) {
  try {
    validateCategoryName(data.name);
    return { success: true };
  } catch (error) {
    if (error instanceof CourseCategoryValidationError) {
      return { 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details
      };
    }
    return { 
      success: false, 
      error: 'Validation failed',
      code: 'VALIDATION_ERROR'
    };
  }
}

/**
 * Course category constraint checking utilities
 */

/**
 * Checks if a course category can be deleted (no courses associated with it)
 * @param id - The course category ID to check
 * @returns Object with canDelete flag and courseCount
 */
export async function checkCourseCategoryConstraints(id: string): Promise<CourseCategoryConstraintCheck> {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.category_id, id));
    
    return {
      canDelete: count === 0,
      courseCount: count
    };
  } catch (error) {
    console.error('Error checking course category constraints:', error);
    // In case of error, assume it cannot be deleted for safety
    return {
      canDelete: false,
      courseCount: 0
    };
  }
}

/**
 * Business rule enforcement utilities
 */

/**
 * Checks if course category name can be updated
 * @param currentName - Current course category name
 * @param newName - New course category name
 * @returns boolean indicating if update is allowed
 */
export function canUpdateCategoryName(currentName: string, newName: string): boolean {
  // For now, allow any name update
  // This could be extended with business rules if needed
  return true;
}