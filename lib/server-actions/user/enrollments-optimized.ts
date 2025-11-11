'use server';

import { and, eq, sql } from 'drizzle-orm';
import { cache } from 'react';
import { sendEnrollmentNotifications } from '@/lib/email/resend';
import { db } from '@/lib/db/drizzle';
import { enrollments, intakes, profiles, courses } from '@/lib/db/schema';
import {
    CreateEnrollmentData,
    UserEnrollmentListItem,
    UserEnrollmentDetail,
    ApiResponse,
} from '@/lib/types/user/enrollments';
import {
    validateEnrollmentData,
    isUserAlreadyEnrolled,
    checkIntakeCapacity,
    UserEnrollmentValidationError,
} from '@/lib/utils/user/enrollments';
import { logger } from '@/lib/utils/logger';
import { createServerSupabaseClient } from '@/utils/supabase/server';

/**
 * Error handling utility
 */
export async function handleUserEnrollmentError(
    error: unknown,
    operation: string
): Promise<ApiResponse<never>> {
    if (error instanceof UserEnrollmentValidationError) {
        return Promise.reject({
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
        });
    }

    if (error instanceof Error) {
        logger.error(`User Enrollment ${operation} failed:`, error);
        return Promise.reject({
            success: false,
            error: error.message,
            code: 'UNKNOWN_ERROR',
        });
    }

    logger.error(
        `Unexpected error in user enrollment ${operation}:`,
        error as Record<string, any>
    );
    return Promise.reject({
        success: false,
        error: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
    });
}

/**
 * Create a new enrollment from form data
 */
export async function createEnrollmentFromFormData(
    formData: FormData
): Promise<ApiResponse<UserEnrollmentDetail>> {
    try {
        // Extract data from FormData
        const courseId = formData.get('courseId') as string;
        const intakeId = formData.get('intakeId') as string;

        // Get authenticated user
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated.',
                code: 'UNAUTHENTICATED',
            };
        }

        // Create enrollment data object
        const enrollmentData: CreateEnrollmentData = {
            courseId,
            intakeId,
            userId: user.id,
        };

        // Validate data
        validateEnrollmentData(enrollmentData);

        // Call internal function with validated data
        return await createEnrollmentInternal(user.id, intakeId, courseId);
    } catch (error: unknown) {
        return handleUserEnrollmentError(error, 'create');
    }
}
/**
 * Internal function to create an enrollment with common logic
 */
async function createEnrollmentInternal(
    userId: string,
    intakeId: string,
    courseId: string
): Promise<ApiResponse<UserEnrollmentDetail>> {
    // Check if the user is already enrolled in this intake
    const alreadyEnrolled = await isUserAlreadyEnrolled(userId, intakeId);
    if (alreadyEnrolled) {
        return {
            success: false,
            error: 'You are already enrolled in this intake.',
            code: 'ALREADY_ENROLLED',
        };
    }

    // Check intake capacity
    const capacityInfo = await checkIntakeCapacity(intakeId);
    if (!capacityInfo.hasCapacity) {
        return {
            success: false,
            error: 'This intake is full.',
            code: 'INTAKE_FULL',
        };
    }

    // Create enrollment
    const [newEnrollment] = await db
        .insert(enrollments)
        .values({
            user_id: userId,
            intake_id: intakeId,
            status: 'requested',
        })
        .returning();

    // Update intake total_registered count
    await db
        .update(intakes)
        .set({ total_registered: capacityInfo.registered + 1 })
        .where(eq(intakes.id, intakeId));

    // Fetch user, course details, and admins for email notification
    const [userProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, userId));

    // Fetch intake details with course information
    const intakeDetails = await db
        .select({
            id: intakes.id,
            start_date: intakes.start_date,
            end_date: intakes.end_date,
            course: {
                id: courses.id,
                title: courses.title,
                course_overview: courses.courseOverview,
                course_higlights: courses.courseHighlights,
            },
        })
        .from(intakes)
        .leftJoin(courses, eq(intakes.course_id, courses.id))
        .where(eq(intakes.id, intakeId))
        .limit(1);

    // Fetch admin emails from database (users with service_role)
    const adminProfiles = await db
        .select({ email: profiles.email })
        .from(profiles)
        .where(eq(profiles.role, 'service_role'));

    // Get admin emails, with fallback to environment variable
    const adminEmails =
        adminProfiles.length > 0
            ? adminProfiles.map(admin => admin.email).filter(Boolean)
            : [process.env.RESEND_TO_EMAIL].filter(Boolean);

    logger.info('Admin emails for enrollment notification:', {
        fromDatabase: adminProfiles.length,
        totalEmails: adminEmails.length,
        emails: adminEmails,
    });

    if (userProfile && adminEmails.length > 0 && intakeDetails.length > 0) {
        // Send enrollment notification emails using Resend
        try {
            const emailResult = await sendEnrollmentNotifications({
                userEmail: userProfile.email,
                userName: userProfile.full_name,
                intakeId: intakeId.toString(),
                courseName: intakeDetails[0].course?.title,
                adminEmails: adminEmails.filter(Boolean) as string[],
            });

            if (!emailResult.success) {
                logger.error('Failed to send enrollment notification emails:', {
                    description: emailResult.error,
                });
                // Don't fail the enrollment if email fails, just log the error
            } else {
                logger.info(
                    'Enrollment notification emails sent successfully:',
                    {
                        userEmail: userProfile.email,
                        adminEmails: adminEmails,
                        courseName: intakeDetails[0].course?.title,
                        emailId: emailResult.data?.userEmail?.data?.id,
                    }
                );
            }
        } catch (emailError) {
            logger.error('Error sending enrollment notification emails:', {
                description: emailError,
            });
            // Don't fail the enrollment if email fails, just log the error
        }
    } else {
        logger.warn(
            'Could not fetch user profile, course details, or admin emails for notification.',
            {
                userId: userId,
                userProfile: !!userProfile,
                adminEmailsCount: adminEmails.length,
                intakeDetailsFound: intakeDetails.length > 0,
            }
        );
    }

    // Return the enrollment with additional details to match UserEnrollmentDetail interface
    const enrollmentWithDetails: UserEnrollmentDetail = {
        ...newEnrollment,
        courseTitle: intakeDetails[0]?.course?.title || null,
        course_highlights: intakeDetails[0]?.course?.course_higlights || null,
        course_overview: intakeDetails[0]?.course?.course_overview || null,
        courseImage: null, // Course image is not part of the enrollment record
        start_date: intakeDetails[0]?.start_date || null,
        end_date: intakeDetails[0]?.end_date || null,
        intake_id: newEnrollment.intake_id || '', // Ensure non-null value
        user_id: newEnrollment.user_id || '', // Ensure non-null value
    };

    return {
        success: true,
        data: enrollmentWithDetails,
    };
}

/**
 * Create a new enrollment from data object
 */
export async function createEnrollment(
    data: CreateEnrollmentData
): Promise<ApiResponse<UserEnrollmentDetail>> {
    try {
        // Get authenticated user
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated.',
                code: 'UNAUTHENTICATED',
            };
        }

        // If userId is not provided in the data, use the authenticated user's ID
        const userId = data.userId || user.id;

        // Validate data
        validateEnrollmentData({
            ...data,
            userId: userId,
        });

        // Call internal function with validated data
        return await createEnrollmentInternal(
            userId,
            data.intakeId,
            data.courseId
        );
    } catch (error: unknown) {
        return handleUserEnrollmentError(error, 'create');
    }
}

interface UserEnrollmentsWithTotal {
    data: UserEnrollmentListItem[];
    total: number;
}

/**
 * Get user's enrollments
 */
export async function getUserEnrollments(): Promise<
    ApiResponse<UserEnrollmentsWithTotal>
> {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                error: 'User not authenticated.',
                code: 'UNAUTHENTICATED',
            };
        }

        const rawResults = await db
            .select({
                id: enrollments.id,
                status: enrollments.status,
                created_at: enrollments.created_at,
                intake_id: enrollments.intake_id,
                user_id: enrollments.user_id,
                courseTitle: courses.title,
                course_highlights: courses.courseHighlights,
                course_overview: courses.courseOverview,
                courseImage: courses.image_url,
                start_date: intakes.start_date,
                end_date: intakes.end_date,
                notes: enrollments.notes,
            })
            .from(enrollments)
            .where(eq(enrollments.user_id, user.id))
            .leftJoin(profiles, eq(enrollments.user_id, profiles.id))
            .leftJoin(intakes, eq(enrollments.intake_id, intakes.id))
            .leftJoin(courses, eq(intakes.course_id, courses.id));

        // Get total count
        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollments)
            .where(eq(enrollments.user_id, user.id));

        // Transform results to ensure required fields are non-null
        const data: UserEnrollmentListItem[] = rawResults.map(item => ({
            ...item,
            intake_id: item.intake_id || '',
            user_id: item.user_id || '',
        }));

        return {
            success: true,
            data: {
                data,
                total: totalResult[0].count,
            },
        };
    } catch (error: unknown) {
        logger.error(
            'Error fetching user enrollments:',
            error as Record<string, any>
        );
        return {
            success: false,
            error: 'Failed to fetch user enrollments',
            code: 'FETCH_ERROR',
        };
    }
}

// Cached version using React cache
export const getCachedUserEnrollments = cache(getUserEnrollments);
