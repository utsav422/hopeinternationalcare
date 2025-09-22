'use server';

// Compatibility layer for existing enrollment server actions
// This file provides backward compatibility for existing code
// while redirecting to the new optimized implementations

import type { ColumnFiltersState } from '@tanstack/react-table';
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';
import type { TypeEnrollmentStatus } from '@/lib/db/schema/enums';
import {
    adminEnrollmentList,
    adminEnrollmentDetails,
    adminEnrollmentCreate,
    adminEnrollmentUpdate,
    adminEnrollmentUpdateStatus,
    adminEnrollmentDelete,
    cachedAdminEnrollmentList,
    cachedAdminEnrollmentDetails
} from '@/lib/server-actions/admin/enrollments-optimized';

/**
 * Compatibility wrapper for adminEnrollmentList
 */
export async function adminEnrollmentListCompat(params: {
    page?: number;
    pageSize?: number;
    filters?: ColumnFiltersState;
}) {
    const { data, success, error, code, details } = await adminEnrollmentList({
        page: params.page,
        pageSize: params.pageSize,
        filters: params.filters
    });

    if (!success) {
        return { success: false, error: error };
    }

    return {
        success: true,
        data: data?.data,
        total: data?.total || 0
    };
}

/**
 * Compatibility wrapper for adminEnrollmentDetailsById
 */
export async function adminEnrollmentDetailsById(id: string) {
    const { data, success, error, code, details } = await adminEnrollmentDetails(id);

    if (!success) {
        return { success: false, error: error };
    }

    return { success: true, data: data?.enrollment };
}

/**
 * Compatibility wrapper for adminEnrollmentDetailsWithJoinsById
 */
export async function adminEnrollmentDetailsWithJoinsById(id: string) {
    const { data, success, error, code, details } = await adminEnrollmentDetails(id);

    if (!success || !data) {
        return { success: false, error: error };
    }

    return {
        success: true,
        data: {
            enrollments: data.enrollment,
            profiles: data.user,
            intakes: data.intake,
            courses: data.course
        }
    };
}

/**
 * Compatibility wrapper for adminEnrollmentListByUserId
 */
export async function adminEnrollmentListByUserId(userId: string) {
    const { success, data, error, code, details } = await cachedAdminEnrollmentList({ userId });

    if (!success || !data) {
        return { success: false, error: error };
    }

    return {
        success: true,
        data: data.data,
        total: data.total
    };
}

/**
 * Compatibility wrapper for adminEnrollmentDetailsWithPaymentById
 */
export async function adminEnrollmentDetailsWithPaymentById(id: string) {
    const { data, success, error, code, details } = await adminEnrollmentDetails(id);

    if (!success || !data) {
        return { success: false, error: error };
    }

    return {
        success: true,
        data: {
            enrollment: {
                id: data.enrollment.id,
                status: data.enrollment.status,
                created_at: data.enrollment.created_at,
                intake_id: data.enrollment.intake_id,
                user_id: data.enrollment.user_id,
            },
            user: {
                id: data.user?.id || null,
                fullName: data.user?.full_name || null,
                email: data.user?.email || null,
            },
            course: {
                id: data.course?.id || null,
                title: data.course?.title || null,
                price: data.course?.price || null,
            },
            intake: {
                id: data.intake?.id || null,
                start_date: data.intake?.start_date || null,
                end_date: data.intake?.end_date || null,
                capacity: data.intake?.capacity || null,
            },
            payment: {
                id: data.payment?.id || null,
                amount: data.payment?.amount || null,
                status: data.payment?.status || null,
                created_at: data.payment?.created_at || null,
            },
        }
    };
}

/**
 * Compatibility wrapper for adminEnrollmentListAll
 */
export async function adminEnrollmentListAll() {
    const { data, success, error, code, details } = await cachedAdminEnrollmentList({});

    if (!success || !data) {
        return { success: false, error: error };
    }

    // Transform to match original format
    const transformedData = data.data.map(item => ({
        enrollment: item,
        user: null, // Would need to fetch separately if needed
        intake: null, // Would need to fetch separately if needed
        course: null, // Would need to fetch separately if needed
        category: null, // Would need to fetch separately if needed
    }));

    return { success: true, data: transformedData };
}

/**
 * Compatibility wrapper for adminEnrollmentListAllByStatus
 */
export async function adminEnrollmentListAllByStatus(status: TypeEnrollmentStatus) {
    const { data, success, error, code, details } = await cachedAdminEnrollmentList({ status });

    if (!success || !data) {
        return { success: false, error: error };
    }

    return { success: true, data: data.data };
}

/**
 * Compatibility wrapper for adminEnrollmentUpsert
 */
export async function adminEnrollmentUpsert(enrollmentData: ZodEnrollmentInsertType) {
    try {
        let result;

        if (enrollmentData.id) {
            // Update existing enrollment
            // The new optimized action expects `undefined` instead of `null` for nullable fields.
            const { id, ...updateData } = enrollmentData;
            const payload = {
                ...updateData,
                user_id: updateData.user_id ?? undefined,
                intake_id: updateData.intake_id ?? undefined,
                notes: updateData.notes ?? undefined,
                enrollment_date: updateData.enrollment_date ?? undefined,
                cancelled_reason: updateData.cancelled_reason ?? undefined,
            };
            result = await adminEnrollmentUpdate(id, payload);
        } else {
            // Create new enrollment
            // The new `adminEnrollmentCreate` action requires valid UUIDs for user_id and intake_id.
            // We should fail early if they are not provided.
            if (!enrollmentData.user_id || !enrollmentData.intake_id) {
                return {
                    success: false,
                    error: 'A valid User ID and Intake ID are required to create an enrollment.',
                    code: 'VALIDATION_ERROR',
                };
            }
            result = await adminEnrollmentCreate({
                user_id: enrollmentData.user_id,
                intake_id: enrollmentData.intake_id,
                status: enrollmentData.status,
                notes: enrollmentData?.notes ?? undefined,
            });
        }

        return result.success && result.data ? { success: true, data: result.data.enrollment } : { success: false, error: result.error };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upsert enrollment'
        };
    }
}

/**
 * Compatibility wrapper for adminEnrollmentUpdateStatusById
 */
export async function adminEnrollmentUpdateStatusById(
    id: string,
    status: TypeEnrollmentStatus,
    cancelled_reason?: string
) {
    const { data, success, error, code, details } = await adminEnrollmentUpdateStatus({
        id,
        status,
        cancelled_reason,
        notify_user: true
    });

    if (!success || !data) {
        return { success: false, error: error };
    }

    return { success: true, data: data.enrollment };
}

/**
 * Compatibility wrapper for adminEnrollmentDeleteById
 */
export async function adminEnrollmentDeleteById(id: string) {
    const { data, success, error, code, details } = await adminEnrollmentDelete(id);

    if (!success || !data) {
        return { success: false, error: error };
    }

    return { success: true };
}

// Cache wrappers for compatibility
export const cachedAdminEnrollmentListCompat = cachedAdminEnrollmentList;
export const cachedAdminEnrollmentDetailsById = cachedAdminEnrollmentDetails;
export const cachedAdminEnrollmentDetailsWithJoinsById = cachedAdminEnrollmentDetails;
export const cachedAdminEnrollmentListByUserId = cachedAdminEnrollmentList;
export const cachedAdminEnrollmentDetailsWithPaymentById = cachedAdminEnrollmentDetails;
export const cachedAdminEnrollmentListAll = cachedAdminEnrollmentList;
export const cachedAdminEnrollmentListAllByStatus = cachedAdminEnrollmentList;