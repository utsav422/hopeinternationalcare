'use server';

import { and, eq, sql } from 'drizzle-orm';
import { cache } from 'react';
import { sendEnrollmentNotifications } from '@/lib/email/resend';
import { db } from '@/lib/db/drizzle';
import { 
  enrollments,
  intakes,
  profiles,
  courses
} from '@/lib/db/schema';
import { 
  CreateEnrollmentData,
  UserEnrollmentListItem,
  UserEnrollmentDetail,
  ApiResponse
} from '@/lib/types/user/enrollments';
import { 
  validateEnrollmentData,
  isUserAlreadyEnrolled,
  checkIntakeCapacity,
  UserEnrollmentValidationError
} from '@/lib/utils/user/enrollments';
import { logger } from '@/lib/utils/logger';
import { createServerSupabaseClient } from '@/utils/supabase/server';

/**
 * Error handling utility
 */
export function handleUserEnrollmentError(error: unknown, operation: string): ApiResponse<never> {
  if (error instanceof UserEnrollmentValidationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details
    };
  }
  
  if (error instanceof Error) {
    logger.error(`User Enrollment ${operation} failed:`, error);
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR'
    };
  }
  
  logger.error(`Unexpected error in user enrollment ${operation}:`, error);
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Create a new enrollment
 */
export async function createEnrollment(data: CreateEnrollmentData): Promise<ApiResponse<UserEnrollmentDetail>> {
  try {
    // Validate data
    validateEnrollmentData(data);
    
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { 
        success: false, 
        error: 'User not authenticated.',
        code: 'UNAUTHENTICATED'
      };
    }

    // Check if the user is already enrolled in this intake
    const alreadyEnrolled = await isUserAlreadyEnrolled(user.id, data.intakeId);
    if (alreadyEnrolled) {
      return {
        success: false,
        error: 'You are already enrolled in this intake.',
        code: 'ALREADY_ENROLLED'
      };
    }

    // Check intake capacity
    const capacityInfo = await checkIntakeCapacity(data.intakeId);
    if (!capacityInfo.hasCapacity) {
      return { 
        success: false, 
        error: 'This intake is full.',
        code: 'INTAKE_FULL' 
      };
    }

    // Create enrollment
    const [newEnrollment] = await db
      .insert(enrollments)
      .values({
        user_id: user.id,
        intake_id: data.intakeId,
        status: 'requested',
      })
      .returning();

    // Update intake total_registered count
    await db
      .update(intakes)
      .set({ total_registered: capacityInfo.registered + 1 })
      .where(eq(intakes.id, data.intakeId));

    // Fetch user, course details, and admins for email notification
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id));

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
        }
      })
      .from(intakes)
      .leftJoin(courses, eq(intakes.course_id, courses.id))
      .where(eq(intakes.id, data.intakeId))
      .limit(1);

    // Fetch admin emails from database (users with service_role)
    const adminProfiles = await db
      .select({ email: profiles.email })
      .from(profiles)
      .where(eq(profiles.role, 'service_role'));

    // Get admin emails, with fallback to environment variable
    const adminEmails = adminProfiles.length > 0
      ? adminProfiles.map(admin => admin.email).filter(Boolean)
      : [process.env.RESEND_TO_EMAIL].filter(Boolean);

    logger.info('Admin emails for enrollment notification:', {
      fromDatabase: adminProfiles.length,
      totalEmails: adminEmails.length,
      emails: adminEmails
    });

    if (userProfile && adminEmails.length > 0 && intakeDetails.length > 0) {
      // Send enrollment notification emails using Resend
      try {
        const emailResult = await sendEnrollmentNotifications({
          userEmail: userProfile.email,
          userName: userProfile.full_name,
          intakeId: data.intakeId.toString(),
          courseName: intakeDetails[0].course?.title,
          adminEmails: adminEmails.filter(Boolean) as string[],
        });

        if (!emailResult.success) {
          logger.error('Failed to send enrollment notification emails:', {description: emailResult.error});
          // Don't fail the enrollment if email fails, just log the error
        } else {
          logger.info('Enrollment notification emails sent successfully:', {
            userEmail: userProfile.email,
            adminEmails: adminEmails,
            courseName: intakeDetails[0].course?.title,
            emailId: emailResult.data?.userEmail?.data?.id
          });
        }
      } catch (emailError) {
        logger.error('Error sending enrollment notification emails:', {description: emailError});
        // Don't fail the enrollment if email fails, just log the error
      }
    } else {
      logger.warn(
        'Could not fetch user profile, course details, or admin emails for notification.',
        {
          userId: user.id,
          userProfile: !!userProfile,
          adminEmailsCount: adminEmails.length,
          intakeDetailsFound: intakeDetails.length > 0,
        }
      );
    }

    return {
      success: true,
      data: newEnrollment,
    };
  } catch (error: unknown) {
    return handleUserEnrollmentError(error, 'create');
  }
}

/**
 * Get user's enrollments
 */
export async function getUserEnrollments(): Promise<ApiResponse<UserEnrollmentListItem[]>> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { 
        success: false, 
        error: 'User not authenticated.',
        code: 'UNAUTHENTICATED'
      };
    }

    const data = await db
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

    return { success: true, data };
  } catch (error: unknown) {
    logger.error('Error fetching user enrollments:', error);
    return {
      success: false,
      error: 'Failed to fetch user enrollments',
      code: 'FETCH_ERROR'
    };
  }
}

// Cached version using React cache
export const getCachedUserEnrollments = cache(getUserEnrollments);