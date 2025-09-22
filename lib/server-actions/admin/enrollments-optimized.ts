'use server';

import type { ColumnFiltersState } from '@tanstack/react-table';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import {
    type EnrollmentListItem,
    type EnrollmentWithDetails,
    type EnrollmentQueryParams,
    type EnrollmentStatusUpdate,
    type EnrollmentCreateData,
    type EnrollmentBulkStatusUpdate
} from '@/lib/types/enrollments';
import type { ApiResponse } from '@/lib/types/shared';
import {
    validateEnrollmentOperation,
    validateEnrollmentStatusTransition,
    handleEnrollmentStatusNotification,
    validateAndIncrementCapacity,
    updateIntakeCapacity,
    syncEnrollmentPaymentStatus,
    handleEnrollmentError,
    safeValidate,
    validateEnrollmentCreateData,
    validateEnrollmentStatusUpdate,
    validateEnrollmentQueryParams,
    validateEnrollmentBulkStatusUpdate,
    enrollmentCreateSchema,
    enrollmentStatusUpdateSchema,
    enrollmentBulkStatusUpdateSchema
} from '@/lib/utils/enrollments';
import { logger } from '@/utils/logger';
import { courseCategories as categoriesSchema } from '@/lib/db/schema/course-categories';
import { courses as courseSchema } from '@/lib/db/schema/courses';
import { enrollments as enrollmentSchema } from '@/lib/db/schema/enrollments';
import { intakes as intakeSchema } from '@/lib/db/schema/intakes';
import { payments as paymentSchema } from '@/lib/db/schema/payments';
import { profiles as profileSchema } from '@/lib/db/schema/profiles';
import { buildFilterConditions, buildWhereClause } from '@/lib/utils/query-utils';

/**
 * Fetches a paginated list of enrollments with optimized query
 */
export async function adminEnrollmentList(params: EnrollmentQueryParams): Promise<ApiResponse<{
    data: EnrollmentListItem[];
    total: number;
    page: number;
    pageSize: number;
}>> {
    try {
        // Validate query parameters
        const validatedParams = validateEnrollmentQueryParams(params);
        const { page = 1, pageSize = 10, filters = [], all = false } = validatedParams;
        const offset = (page - 1) * pageSize;

        // Define column mappings for filtering
        const columnMap = {
            id: enrollmentSchema.id,
            payment_id: paymentSchema.id,
            status: enrollmentSchema.status,
            created_at: enrollmentSchema.created_at,
            intake_id: enrollmentSchema.intake_id,
            user_id: enrollmentSchema.user_id,
            fullName: profileSchema.full_name,
            email: profileSchema.email,
            courseTitle: courseSchema.title,
            start_date: intakeSchema.start_date,
            notes: enrollmentSchema.notes,
        };

        // Build filter conditions using utility function
        const filterConditions = buildFilterConditions(filters, columnMap);
        const whereClause = buildWhereClause(filterConditions);

        // Fetch enrollment list with all required joins
        const query = db
            .select({
                id: enrollmentSchema.id,
                notes: enrollmentSchema.notes,
                status: enrollmentSchema.status,
                created_at: enrollmentSchema.created_at,
                intake_id: enrollmentSchema.intake_id,
                user_id: enrollmentSchema.user_id,
                price: courseSchema.price,
                payment_id: paymentSchema.id,
                fullName: profileSchema.full_name,
                email: profileSchema.email,
                courseTitle: courseSchema.title,
                course_id: courseSchema.id,
                start_date: intakeSchema.start_date,
            })
            .from(enrollmentSchema)
            .where(whereClause)
            .leftJoin(paymentSchema, eq(paymentSchema.enrollment_id, enrollmentSchema.id))
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

        if (!all) {
            query.offset(offset).limit(pageSize);
        }

        const data = await query;


        // Transform to EnrollmentListItem format
        const enrollmentList: EnrollmentListItem[] = data.map(item => ({
            id: item.id,
            status: item.status,
            created_at: item.created_at,
            notes: item.notes,
            user: {
                id: item.user_id || '',
                fullName: item.fullName || '',
                email: item.email || '',
            },
            course: {
                id: item.course_id || '', // This should be course ID
                title: item.courseTitle || '',
                price: item.price || 0,
            },
            intake: {
                id: item.intake_id || '',
                start_date: item.start_date || '',
                end_date: null, // We don't fetch end_date in this query for performance
            },
            payment: {
                id: item.payment_id || '',
                status: null, // We don't fetch payment status in this query for performance
                amount: item.price || 0,
            },
        }));

        // Get total count
        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollmentSchema)
            .where(whereClause);

        return {
            success: true,
            data: {
                data: enrollmentList,
                total: totalResult[0].count,
                page,
                pageSize,
            }
        };
    } catch (error) {
        logger.error('Error fetching enrollment list', { error });
        return handleEnrollmentError(error, 'list');
    }
}

/**
 * Fetches comprehensive enrollment details by ID
 */
export async function adminEnrollmentDetails(id: string): Promise<ApiResponse<EnrollmentWithDetails>> {
    try {
        // Validate input
        if (!id) {
            return handleEnrollmentError(new Error('Enrollment ID is required'), 'details');
        }

        const result = await db
            .select({
                enrollment: enrollmentSchema,
                user: profileSchema,
                intake: intakeSchema,
                course: courseSchema,
                category: categoriesSchema,
                payment: paymentSchema,
            })
            .from(enrollmentSchema)
            .where(eq(enrollmentSchema.id, id))
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id))
            .leftJoin(categoriesSchema, eq(courseSchema.category_id, categoriesSchema.id))
            .leftJoin(paymentSchema, eq(paymentSchema.enrollment_id, enrollmentSchema.id))
            .limit(1);

        if (result.length === 0) {
            return handleEnrollmentError(new Error('Enrollment not found'), 'details');
        }

        const enrollmentData = result[0];

        return {
            success: true,
            data: {
                enrollment: enrollmentData.enrollment,
                user: enrollmentData.user || null,
                intake: enrollmentData.intake || null,
                course: enrollmentData.course || null,
                category: enrollmentData.category || null,
                payment: enrollmentData.payment || null,
            }
        };
    } catch (error) {
        logger.error('Error fetching enrollment details', { error, enrollmentId: id });
        return handleEnrollmentError(error, 'details');
    }
}

/**
 * Creates a new enrollment
 */
export async function adminEnrollmentCreate(data: EnrollmentCreateData): Promise<ApiResponse<EnrollmentWithDetails>> {
    try {
        // Validate enrollment creation data
        const validationResult = safeValidate(enrollmentCreateSchema, data);
        if (!validationResult.success) {
            return handleEnrollmentError(new Error(validationResult.error), 'create');
        }

        const validatedData = validationResult.data;

        // Validate enrollment operation
        validateEnrollmentOperation('create', validatedData);

        // Validate and increment intake capacity
        await validateAndIncrementCapacity(validatedData.intake_id);

        // Create the enrollment
        const [newEnrollment] = await db
            .insert(enrollmentSchema)
            .values({
                user_id: validatedData.user_id,
                intake_id: validatedData.intake_id,
                status: validatedData.status || 'requested',
                notes: validatedData.notes,
            })
            .returning();

        // Create associated payment record
        const intakeDetails = await db
            .select({ course_id: intakeSchema.course_id })
            .from(intakeSchema)
            .where(validatedData.intake_id ? eq(intakeSchema.id, validatedData.intake_id) : sql`false`);

        if (intakeDetails.length > 0 && intakeDetails[0].course_id) {
            const courseDetails = await db
                .select({ price: courseSchema.price })
                .from(courseSchema)
                .where(eq(courseSchema.id, intakeDetails[0].course_id));

            if (courseDetails.length > 0) {
                await db.insert(paymentSchema).values({
                    enrollment_id: newEnrollment.id,
                    amount: courseDetails[0].price,
                    status: 'pending',
                    method: 'cash',
                });
            }
        }

        // Fetch complete enrollment details
        const enrollmentResult = await adminEnrollmentDetails(newEnrollment.id);

        if (!enrollmentResult.success) {
            throw new Error('Failed to fetch created enrollment details');
        }

        revalidatePath('/admin/enrollments');
        return {
            success: true,
            data: enrollmentResult.data
        };
    } catch (error) {
        logger.error('Error creating enrollment', { error, data });
        return handleEnrollmentError(error, 'create');
    }
}

/**
 * Updates an existing enrollment
 */
export async function adminEnrollmentUpdate(
    id: string,
    data: Partial<EnrollmentCreateData>
): Promise<ApiResponse<EnrollmentWithDetails>> {
    try {
        // Validate input
        if (!id) {
            return handleEnrollmentError(new Error('Enrollment ID is required'), 'update');
        }

        // Fetch existing enrollment for validation
        const existingResult = await adminEnrollmentDetails(id);
        if (!existingResult.success) {
            return handleEnrollmentError(new Error('Enrollment not found for update'), 'update');
        }

        // Validate update operation
        validateEnrollmentOperation('update', data, existingResult.data);

        // Update the enrollment
        const [updatedEnrollment] = await db
            .update(enrollmentSchema)
            .set(data)
            .where(eq(enrollmentSchema.id, id))
            .returning();

        // Fetch complete updated enrollment details
        const enrollmentResult = await adminEnrollmentDetails(id);

        if (!enrollmentResult.success) {
            throw new Error('Failed to fetch updated enrollment details');
        }

        revalidatePath('/admin/enrollments');
        return {
            success: true,
            data: enrollmentResult.data
        };
    } catch (error) {
        logger.error('Error updating enrollment', { error, enrollmentId: id, data });
        return handleEnrollmentError(error, 'update');
    }
}

/**
 * Updates enrollment status
 */
export async function adminEnrollmentUpdateStatus(
    update: EnrollmentStatusUpdate
): Promise<ApiResponse<EnrollmentWithDetails>> {
    try {
        // Validate input data
        const validationResult = safeValidate(enrollmentStatusUpdateSchema, update);
        if (!validationResult.success) {
            return handleEnrollmentError(new Error(validationResult.error), 'status update');
        }

        const validatedUpdate = validationResult.data;
        const { id, status, cancelled_reason, notify_user = true } = validatedUpdate;

        // Validate input
        if (!id) {
            return handleEnrollmentError(new Error('Enrollment ID is required'), 'status update');
        }

        // Fetch enrollment details before updating
        const enrollmentResult = await adminEnrollmentDetails(id);
        if (!enrollmentResult.success || !enrollmentResult.data) {
            return handleEnrollmentError(new Error('Enrollment not found'), 'status update');
        }

        const enrollment = enrollmentResult.data;

        // Validate status transition
        validateEnrollmentStatusTransition(enrollment.enrollment.status, status);

        // Update enrollment status
        const [updatedEnrollment] = await db
            .update(enrollmentSchema)
            .set({
                status,
                cancelled_reason: status === 'cancelled' ? cancelled_reason : undefined
            })
            .where(eq(enrollmentSchema.id, id))
            .returning();

        // Sync payment status
        await syncEnrollmentPaymentStatus(id, status);

        // Send notification if requested
        if (notify_user) {
            await handleEnrollmentStatusNotification(
                enrollment,
                enrollment.enrollment.status,
                status,
                cancelled_reason
            );
        }

        // Fetch complete updated enrollment details
        const updatedEnrollmentResult = await adminEnrollmentDetails(id);

        if (!updatedEnrollmentResult.success) {
            throw new Error('Failed to fetch updated enrollment details');
        }

        revalidatePath('/admin/enrollments');
        return {
            success: true,
            data: updatedEnrollmentResult.data
        };
    } catch (error) {
        logger.error('Error updating enrollment status', { error, update });
        return handleEnrollmentError(error, 'status update');
    }
}

/**
 * Bulk updates enrollment statuses
 */
export async function adminEnrollmentBulkStatusUpdate(
    updates: EnrollmentBulkStatusUpdate
): Promise<ApiResponse<EnrollmentWithDetails[]>> {
    try {
        // Validate input data
        const validationResult = safeValidate(enrollmentBulkStatusUpdateSchema, updates);
        if (!validationResult.success) {
            return handleEnrollmentError(new Error(validationResult.error), 'bulk status update');
        }

        const validatedUpdates = validationResult.data;
        const { ids, status, cancelled_reason } = validatedUpdates;

        if (!ids || ids.length === 0) {
            return handleEnrollmentError(new Error('At least one enrollment ID is required'), 'bulk status update');
        }

        const updatedEnrollments: EnrollmentWithDetails[] = [];

        // Update each enrollment
        for (const id of ids) {
            const updateResult = await adminEnrollmentUpdateStatus({
                id,
                status,
                cancelled_reason,
                notify_user: true
            });

            if (updateResult.success && updateResult.data) {
                updatedEnrollments.push(updateResult.data);
            } else {
                logger.warn('Failed to update enrollment status in bulk operation', {
                    enrollmentId: id,
                    error: updateResult.error
                });
            }
        }

        revalidatePath('/admin/enrollments');
        return {
            success: true,
            data: updatedEnrollments
        };
    } catch (error) {
        logger.error('Error in bulk enrollment status update', { error, updates });
        return handleEnrollmentError(error, 'bulk status update');
    }
}

/**
 * Deletes an enrollment
 */
export async function adminEnrollmentDelete(id: string): Promise<ApiResponse<void>> {
    try {
        // Validate input
        if (!id) {
            return handleEnrollmentError(new Error('Enrollment ID is required'), 'delete');
        }

        // Fetch existing enrollment for validation
        const existingResult = await adminEnrollmentDetails(id);
        if (!existingResult.success) {
            return handleEnrollmentError(new Error('Enrollment not found for deletion'), 'delete');
        }

        // Validate delete operation
    if (!existingResult.success || !existingResult.data) {
      return handleEnrollmentError(new Error('Enrollment not found for deletion'), 'delete');
    }
    
    validateEnrollmentOperation('delete', {}, existingResult.data);

    // Delete the enrollment
    await db
      .delete(enrollmentSchema)
      .where(eq(enrollmentSchema.id, id));

    // Decrement intake capacity
    if (existingResult.data.enrollment.intake_id) {
      await updateIntakeCapacity(existingResult.data.enrollment.intake_id, 'decrement');
    }

    revalidatePath('/admin/enrollments');
    return {
      success: true
    };
  } catch (error) {
    logger.error('Error deleting enrollment', { error, enrollmentId: id });
    return handleEnrollmentError(error, 'delete');
  }
}

// Cache wrappers for better performance
export const cachedAdminEnrollmentList = cache(adminEnrollmentList);
export const cachedAdminEnrollmentDetails = cache(adminEnrollmentDetails);