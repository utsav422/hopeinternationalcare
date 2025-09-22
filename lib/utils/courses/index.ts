import { db } from '@/lib/db/drizzle';
import { intakes } from '@/lib/db/schema/intakes';
import { enrollments } from '@/lib/db/schema/enrollments';
import { eq, sql } from 'drizzle-orm';
import { CourseCreateData, CourseUpdateData, CourseConstraintCheck } from '@/lib/types/courses';

/**
 * Course validation utilities
 */

export class CourseValidationError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'CourseValidationError';
    }
}

/**
 * Validates course title
 * @param title - The course title to validate
 * @throws CourseValidationError if validation fails
 */
export function validateCourseTitle(title: string): void {
    if (title.length < 3) {
        throw new CourseValidationError(
            'Title must be at least 3 characters long',
            'TITLE_TOO_SHORT',
            { title, length: title.length }
        );
    }

    if (title.length > 255) {
        throw new CourseValidationError(
            'Title cannot exceed 255 characters',
            'TITLE_TOO_LONG',
            { title, length: title.length }
        );
    }
}

/**
 * Validates course price
 * @param price - The course price to validate
 * @returns boolean indicating if price is valid
 */
export function validateCoursePrice(price: number): boolean {
    return price >= 0;
}

/**
 * Validates course duration
 * @param type - The duration type
 * @param value - The duration value
 * @returns boolean indicating if duration is valid
 */
export function validateCourseDuration(type: string, value: number): boolean {
    // Valid duration types
    const validTypes = ['days', 'weeks', 'months', 'years'];

    if (!validTypes.includes(type)) {
        return false;
    }

    return value > 0;
}

/**
 * Validates course slug
 * @param slug - The course slug to validate
 * @returns boolean indicating if slug is valid
 */
export function validateCourseSlug(slug: string): boolean {
    // Basic slug validation - alphanumeric, hyphens, underscores only
    const slugRegex = /^[a-z0-9-_]+$/;
    return slugRegex.test(slug);
}

/**
 * Validates course data
 * @param data - The course data to validate
 * @returns ValidationResult
 */
export function validateCourseData(data: CourseCreateData | CourseUpdateData) {
    try {
        validateCourseTitle(data.title);

        if (!validateCoursePrice(data.price)) {
            throw new CourseValidationError(
                'Price must be a positive number',
                'INVALID_PRICE',
                { price: data.price }
            );
        }

        if (!validateCourseDuration(data.duration_type ?? '', data?.duration_value ?? 0)) {
            throw new CourseValidationError(
                'Invalid duration type or value',
                'INVALID_DURATION',
                { type: data.duration_type, value: data.duration_value }
            );
        }

        if (!validateCourseSlug(data.slug)) {
            throw new CourseValidationError(
                'Invalid slug format. Only lowercase letters, numbers, hyphens, and underscores allowed.',
                'INVALID_SLUG',
                { slug: data.slug }
            );
        }

        return { success: true };
    } catch (error) {
        if (error instanceof CourseValidationError) {
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
 * Course constraint checking utilities
 */

/**
 * Checks if a course can be deleted (no intakes or enrollments associated with it)
 * @param id - The course ID to check
 * @returns Object with canDelete flag and counts
 */
export async function checkCourseConstraints(id: string): Promise<CourseConstraintCheck> {
    try {
        // Check intakes
        const intakeResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(intakes)
            .where(eq(intakes.course_id, id));

        const intakeCount = intakeResult[0]?.count || 0;

        // Check enrollments through intakes
        const enrollmentResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .innerJoin(intakes, eq(enrollments.intake_id, intakes.id))
            .where(eq(intakes.course_id, id));

        const enrollmentCount = enrollmentResult[0]?.count || 0;

        return {
            canDelete: intakeCount === 0 && enrollmentCount === 0,
            intakeCount,
            enrollmentCount
        };
    } catch (error) {
        console.error('Error checking course constraints:', error);
        // In case of error, assume it cannot be deleted for safety
        return {
            canDelete: false,
            intakeCount: 0,
            enrollmentCount: 0
        };
    }
}

/**
 * Image management utilities
 */

/**
 * Uploads a course image
 * @param file - The file to upload
 * @param courseId - The course ID
 * @returns Promise with image URL
 */
export async function uploadCourseImage(file: File, courseId: string): Promise<string> {
    // This is a placeholder implementation
    // In a real implementation, this would upload to a storage service
    // and return the URL
    console.log(`Uploading image for course ${courseId}`);
    return `https://example.com/images/course-${courseId}-${Date.now()}.jpg`;
}

/**
 * Deletes a course image
 * @param imageUrl - The image URL to delete
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteCourseImage(imageUrl: string): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, this would delete from a storage service
    console.log(`Deleting image ${imageUrl}`);
}