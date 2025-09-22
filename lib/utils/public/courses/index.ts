import { db } from '@/lib/db/drizzle';
import { courses, courseCategories, intakes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { PublicCourseListItem, PublicCourseDetail, PublicCourseQueryParams } from '../types/public/courses';

/**
 * Public course validation utilities
 */

export class PublicCourseValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PublicCourseValidationError';
  }
}

/**
 * Validates course search filters
 * @param filters - The filters to validate
 * @throws PublicCourseValidationError if validation fails
 */
export function validateCourseFilters(filters: any): void {
  if (filters.title && typeof filters.title !== 'string') {
    throw new PublicCourseValidationError(
      'Title filter must be a string',
      'INVALID_TITLE_FILTER',
      { title: filters.title }
    );
  }
  
  if (filters.category && typeof filters.category !== 'string') {
    throw new PublicCourseValidationError(
      'Category filter must be a string',
      'INVALID_CATEGORY_FILTER',
      { category: filters.category }
    );
  }
  
  if (filters.duration && (typeof filters.duration !== 'number' || filters.duration <= 0)) {
    throw new PublicCourseValidationError(
      'Duration filter must be a positive number',
      'INVALID_DURATION_FILTER',
      { duration: filters.duration }
    );
  }
  
  if (filters.intake_date) {
    const date = new Date(filters.intake_date);
    if (isNaN(date.getTime())) {
      throw new PublicCourseValidationError(
        'Invalid date format for intake_date filter',
        'INVALID_INTAKE_DATE_FILTER',
        { intake_date: filters.intake_date }
      );
    }
  }
}

/**
 * Validates course query parameters
 * @param params - The query parameters to validate
 * @returns ValidationResult
 */
export function validateCourseQueryParams(params: PublicCourseQueryParams) {
  try {
    if (params.page !== undefined && (typeof params.page !== 'number' || params.page < 1)) {
      throw new PublicCourseValidationError(
        'Page must be a positive number',
        'INVALID_PAGE',
        { page: params.page }
      );
    }
    
    if (params.pageSize !== undefined && (typeof params.pageSize !== 'number' || params.pageSize < 1 || params.pageSize > 100)) {
      throw new PublicCourseValidationError(
        'Page size must be between 1 and 100',
        'INVALID_PAGE_SIZE',
        { pageSize: params.pageSize }
      );
    }
    
    if (params.filters) {
      validateCourseFilters(params.filters);
    }
    
    const validSortColumns = ['created_at', 'name', 'category', 'price', 'duration_type', 'duration_value'];
    if (params.sortBy && !validSortColumns.includes(params.sortBy)) {
      throw new PublicCourseValidationError(
        `Invalid sort column. Valid options: ${validSortColumns.join(', ')}`,
        'INVALID_SORT_COLUMN',
        { sortBy: params.sortBy, validOptions: validSortColumns }
      );
    }
    
    if (params.sortOrder && !['asc', 'desc'].includes(params.sortOrder)) {
      throw new PublicCourseValidationError(
        'Sort order must be either "asc" or "desc"',
        'INVALID_SORT_ORDER',
        { sortOrder: params.sortOrder }
      );
    }
    
    return { success: true };
  } catch (error) {
    if (error instanceof PublicCourseValidationError) {
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
 * Public course business logic utilities
 */

/**
 * Builds filter conditions for public courses
 * @param filters - The filters to apply
 * @returns Array of SQL conditions
 */
export function buildPublicCourseFilterConditions(filters: any) {
  const conditions = [];
  
  if (filters.title) {
    conditions.push(sql`${courses.title} ILIKE ${`%${filters.title}%`}`);
  }
  
  if (filters.category) {
    conditions.push(eq(courseCategories.id, filters.category));
  }
  
  if (filters.duration) {
    conditions.push(eq(courses.duration_value, filters.duration));
  }
  
  if (filters.intake_date) {
    const date = new Date(filters.intake_date);
    if (!isNaN(date.getTime())) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${intakes} 
          WHERE ${intakes.course_id} = ${courses.id} 
          AND ${intakes.start_date} <= ${date.toISOString()} 
          AND ${intakes.end_date} >= ${date.toISOString()}
        )`
      );
    }
  }
  
  return conditions;
}

/**
 * Calculates available seats for an intake
 * @param capacity - The intake capacity
 * @param registered - The number of registered students
 * @returns Number of available seats
 */
export function calculateAvailableSeats(capacity: number, registered: number): number {
  return Math.max(0, capacity - registered);
}