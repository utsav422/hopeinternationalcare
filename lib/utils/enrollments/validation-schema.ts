import { z } from 'zod';
import { type EnrollmentCreateData, type EnrollmentStatusUpdate, type EnrollmentQueryParams } from '@/lib/types/enrollments';

/**
 * Zod schema for enrollment creation data validation
 */
export const enrollmentCreateSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  intake_id: z.string().uuid('Invalid intake ID'),
  status: z.enum(['requested', 'enrolled', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

/**
 * Zod schema for enrollment status update validation
 */
export const enrollmentStatusUpdateSchema = z.object({
  id: z.string().uuid('Invalid enrollment ID'),
  status: z.enum(['requested', 'enrolled', 'completed', 'cancelled']),
  cancelled_reason: z.string().optional(),
  notify_user: z.boolean().optional().default(true),
});

/**
 * Zod schema for enrollment query parameters validation
 */
export const enrollmentQuerySchema = z.object({
  page: z.number().min(1).optional().default(1),
  pageSize: z.number().min(1).max(100).optional().default(10),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(['requested', 'enrolled', 'completed', 'cancelled']).optional(),
  userId: z.string().uuid().optional(),
});

/**
 * Zod schema for bulk enrollment status updates
 */
export const enrollmentBulkStatusUpdateSchema = z.object({
  ids: z.array(z.string().uuid('Invalid enrollment ID')).min(1, 'At least one enrollment ID is required'),
  status: z.enum(['requested', 'enrolled', 'completed', 'cancelled']),
  cancelled_reason: z.string().optional(),
});

/**
 * Validates enrollment creation data
 */
export function validateEnrollmentCreateData(data: unknown): EnrollmentCreateData {
  return enrollmentCreateSchema.parse(data);
}

/**
 * Validates enrollment status update data
 */
export function validateEnrollmentStatusUpdate(data: unknown): EnrollmentStatusUpdate {
  return enrollmentStatusUpdateSchema.parse(data);
}

/**
 * Validates enrollment query parameters
 */
export function validateEnrollmentQueryParams(params: unknown): EnrollmentQueryParams {
  return enrollmentQuerySchema.parse(params);
}

/**
 * Validates bulk enrollment status update data
 */
export function validateEnrollmentBulkStatusUpdate(data: unknown): { ids: string[]; status: string; cancelled_reason?: string } {
  return enrollmentBulkStatusUpdateSchema.parse(data);
}

/**
 * Safely validates data with error handling
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return { success: false, error: `Validation failed: ${errorMessage}` };
    }
    return { success: false, error: 'Validation failed' };
  }
}