// /server-action/user/enrollments.ts
'use server';

import { eq } from 'drizzle-orm';
import { cache } from 'react';
import { sendEnrollmentNotifications } from '@/lib/email/resend';
import { db } from '@/lib/db/drizzle';
import { EnrollmentRequestSchema } from '@/lib/db/drizzle-zod-schema/enrollments';
import { enrollments } from '@/lib/db/schema/enrollments';
import { EnrollmentStatus } from '@/lib/db/schema/enums';
import { intakes } from '@/lib/db/schema/intakes';
import { profiles } from '@/lib/db/schema/profiles';
import { courses } from '@/lib/db/schema/courses';
import { logger } from '@/utils/logger';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export async function createEnrollment(formData: FormData) {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not authenticated.' };
        }

        const data = {
            courseId: formData.get('courseId'),
            intakeId: formData.get('intakeId'),
            userId: user.id,
        };

        const parsed = EnrollmentRequestSchema.safeParse(data);

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.message,
            };
        }

        const { intakeId, userId: parsedUserId } = parsed.data;

        if (!parsedUserId) {
            return { success: false, error: 'User ID is missing after parsing.' };
        }

        const userId: string = parsedUserId;

        // Check if the user is already enrolled in this intake
        const existingEnrollment = await db.query.enrollments.findFirst({
            where: (enrollments, { eq, and }) =>
                and(
                    eq(enrollments.user_id, userId),
                    eq(enrollments.intake_id, intakeId)
                ),
        });

        if (existingEnrollment) {
            return {
                success: false,
                error: 'You are already enrolled in this intake.',
            };
        }

        // Check intake capacity
        const intakeData = await db.query.intakes.findFirst({
            where: (intakes, { eq }) => eq(intakes.id, intakeId),
        });

        if (!intakeData) {
            return { success: false, error: 'Intake not found.' };
        }

        if (intakeData.total_registered >= intakeData.capacity) {
            return { success: false, error: 'This intake is full.' };
        }

        // Create enrollment
        const [newEnrollment] = await db
            .insert(enrollments)
            .values({
                user_id: userId,
                intake_id: intakeId,
                status: EnrollmentStatus.requested,
            })
            .returning();

        // Update intake total_registered count
        await db
            .update(intakes)
            .set({ total_registered: intakeData.total_registered + 1 })
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
                }
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
                    intakeId: intakeId.toString(),
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
                    userId,
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
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to submit enrollment request: ${errorMessage}`,
        };
    }
}

export async function getUserEnrollments() {
    try {
        const supabase = await createServerSupabaseClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not authenticated.' };
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
            success: false,
            error: `Failed to fetch user enrollments: ${errorMessage}`,
        };
    }
}

// Cached version using React cache
export const getCachedUserEnrollments = cache(getUserEnrollments);
