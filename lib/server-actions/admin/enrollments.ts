/*
 * DEPRECATED: This file contains the old enrollment server actions implementation.
 * 
 * PLEASE USE THE NEW OPTIMIZED VERSIONS:
 * - For new code: import from '@/lib/server-actions/admin/enrollments-optimized'
 * - For backward compatibility: import from '@/lib/server-actions/admin/enrollments-compat'
 * 
 * This file is maintained for backward compatibility only and will be removed in a future release.
 */

'use server';

import type { ColumnFiltersState } from '@tanstack/react-table';
import {
    type AnyColumn,
    eq,
    gte,
    inArray,
    lte,
    type SQL,
    sql,
} from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { cache } from 'react';
import { db } from '@/lib/db/drizzle';
import type { ZodEnrollmentInsertType } from '@/lib/db/drizzle-zod-schema/enrollments';
import { emailService } from '@/lib/email/service';
import { logger } from '@/utils/logger';
import { courseCategories as categoriesSchema } from '@/lib/db/schema/course-categories';
import { courses as courseSchema } from '@/lib/db/schema/courses';
import { enrollments as enrollmentSchema } from '@/lib/db/schema/enrollments';
import type {
    TypeEnrollmentStatus,
    TypePaymentStatus,
} from '@/lib/db/schema/enums'; // Import enums
import { intakes as intakeSchema } from '@/lib/db/schema/intakes';
import { payments as paymentSchema } from '@/lib/db/schema/payments';
import { profiles as profileSchema } from '@/lib/db/schema/profiles';
import { buildFilterConditions, buildWhereClause } from '@/lib/utils/query-utils';
import { OurCoursesOverview } from '@/app';

export async function adminEnrollmentList(params: {
    page?: number;
    pageSize?: number;
    filters?: ColumnFiltersState;
}) {
    try {
        const { page = 1, pageSize = 10, filters = [] } = params;
        const offset = (page - 1) * pageSize;

        // Define column mappings for filtering
        const columnMap: Record<string, AnyColumn> = {
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

        const data = await db
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
                start_date: intakeSchema.start_date,
            })
            .from(enrollmentSchema)
            .where(whereClause)
            .leftJoin(
                paymentSchema,
                eq(paymentSchema.enrollment_id, enrollmentSchema.id)
            )
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id))
            .offset(offset)
            .limit(pageSize);

        const total = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollmentSchema)
            .where(whereClause);

        return { success: true, data, total: total[0].count };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export async function adminEnrollmentDetailsById(id: string) {
    try {
        const data = await db
            .select({
                id: enrollmentSchema.id,
                status: enrollmentSchema.status,
                created_at: enrollmentSchema.created_at,
                intake_id: enrollmentSchema.intake_id,
                user_id: enrollmentSchema.user_id,
                cancelled_reason: enrollmentSchema.cancelled_reason,
                enrollment_data: enrollmentSchema.enrollment_date,
                fullName: profileSchema.full_name,
                email: profileSchema.email,
                courseTitle: courseSchema.title,
                course_overview: courseSchema.courseOverview,
                course_highlight: courseSchema.courseHighlights,
                image: courseSchema.image_url,
                price: courseSchema.price,
                duration_type: courseSchema.duration_type,
                duration_value: courseSchema.duration_value,
                start_date: intakeSchema.start_date,
                end_date: intakeSchema.end_date,
                notes: enrollmentSchema.notes,
            })
            .from(enrollmentSchema)
            .where(eq(enrollmentSchema.id, id))
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

        return { success: true, data: data[0] };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export async function adminEnrollmentDetailsWithJoinsById(id: string) {
    try {
        const result = await db
            .select()
            .from(enrollmentSchema)
            .where(eq(enrollmentSchema.id, id))
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));
        return { success: true, data: result[0] };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export async function adminEnrollmentListByUserId(userId: string) {
    try {
        const data = await db
            .select({
                id: enrollmentSchema.id,
                status: enrollmentSchema.status,
                created_at: enrollmentSchema.created_at,
                intake_id: enrollmentSchema.intake_id,
                user_id: enrollmentSchema.user_id,
                fullName: profileSchema.full_name,
                email: profileSchema.email,
                courseTitle: courseSchema.title,
                start_date: intakeSchema.start_date,
                notes: enrollmentSchema.notes,
            })
            .from(enrollmentSchema)
            .where(eq(enrollmentSchema.user_id, userId))
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

        const total = await db
            .select({ count: sql<number>`count(*)` })
            .from(enrollmentSchema)
            .where(eq(enrollmentSchema.user_id, userId));

        return { success: true, data, total: total[0].count };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export async function adminEnrollmentDetailsWithPaymentById(id: string) {
    try {
        const data = await db
            .select({
                enrollment: {
                    id: enrollmentSchema.id,
                    status: enrollmentSchema.status,
                    created_at: enrollmentSchema.created_at,
                    intake_id: enrollmentSchema.intake_id,
                    user_id: enrollmentSchema.user_id,
                },
                user: {
                    id: profileSchema.id,
                    fullName: profileSchema.full_name,
                    email: profileSchema.email,
                },
                course: {
                    id: courseSchema.id,
                    title: courseSchema.title,
                    price: courseSchema.price,
                },
                intake: {
                    id: intakeSchema.id,
                    start_date: intakeSchema.start_date,
                    end_date: intakeSchema.end_date,
                    capacity: intakeSchema.capacity,
                },
                payment: {
                    id: paymentSchema.id,
                    amount: paymentSchema.amount,
                    status: paymentSchema.status,
                    created_at: paymentSchema.created_at,
                },
            })
            .from(enrollmentSchema)
            .where(eq(enrollmentSchema.id, id))
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id));

        return { success: true, data: data[0] };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export async function adminEnrollmentUpsert(
    enrollmentData: ZodEnrollmentInsertType
) {
    try {
        let data: (typeof enrollmentSchema.$inferSelect)[];
        if (enrollmentData.id) {
            data = await db
                .update(enrollmentSchema)
                .set(enrollmentData)
                .where(eq(enrollmentSchema.id, enrollmentData.id))
                .returning();
        } else {
            const newEnrollment = await db
                .insert(enrollmentSchema)
                .values(enrollmentData)
                .returning();
            data = newEnrollment;

            if (newEnrollment[0].id) {
                // Fetch course price based on intake_id
                const intakeDetails = await db
                    .select({ course_id: intakeSchema.course_id })
                    .from(intakeSchema)
                    .where(eq(intakeSchema.id, newEnrollment[0].intake_id as string));

                if (intakeDetails.length > 0) {
                    const courseDetails = await db
                        .select({ price: courseSchema.price })
                        .from(courseSchema)
                        .where(eq(courseSchema.id, intakeDetails[0].course_id as string));

                    if (courseDetails.length > 0) {
                        const paymentAmount = courseDetails[0].price;
                        await db.insert(paymentSchema).values({
                            enrollment_id: newEnrollment[0].id,
                            amount: paymentAmount,
                            status: 'pending',
                            method: 'cash',
                        });
                    }
                }
            }

            // Increment total_registered in the intake
            if (enrollmentData.intake_id) {
                await db
                    .update(intakeSchema)
                    .set({
                        total_registered: sql`${intakeSchema.total_registered} + 1`,
                    })
                    .where(eq(intakeSchema.id, enrollmentData.intake_id));
            }
        }

        revalidatePath('/admin/enrollments');
        return { success: true, data: data[0] };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'An unexpected error occurred',
        };
    }
}

export async function adminEnrollmentUpdateStatusById(
    id: string,
    status: TypeEnrollmentStatus,
    cancelled_reason?: string
) {
    try {
        // Fetch enrollment details before updating for email notification
        const enrollmentDetails = await db
            .select({
                id: enrollmentSchema.id,
                user_id: enrollmentSchema.user_id,
                intake_id: enrollmentSchema.intake_id,
                status: enrollmentSchema.status,
                userEmail: profileSchema.email,
                userName: profileSchema.full_name,
                courseTitle: courseSchema.title,
                intakeStartDate: intakeSchema.start_date,
            })
            .from(enrollmentSchema)
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id))
            .where(eq(enrollmentSchema.id, id))
            .limit(1);

        const data = await db
            .update(enrollmentSchema)
            .set({ status, notes: cancelled_reason })
            .where(eq(enrollmentSchema.id, id))
            .returning();

        // Fetch the enrollment to get the associated payment
        const enrollmentWithPayment = await db
            .select({
                paymentId: paymentSchema.id,
                enrollmentStatus: enrollmentSchema.status,
            })
            .from(enrollmentSchema)
            .leftJoin(
                paymentSchema,
                eq(paymentSchema.enrollment_id, enrollmentSchema.id)
            )
            .where(eq(enrollmentSchema.id, id));

        if (
            enrollmentWithPayment.length > 0 &&
            enrollmentWithPayment[0].paymentId
        ) {
            let newPaymentStatus: TypePaymentStatus | undefined;

            if (status === 'enrolled' || status === 'completed') {
                newPaymentStatus = 'completed';
            } else if (status === 'cancelled') {
                newPaymentStatus = 'cancelled';
            }

            if (newPaymentStatus) {
                await db
                    .update(paymentSchema)
                    .set({ status: newPaymentStatus })
                    .where(eq(paymentSchema.id, enrollmentWithPayment[0].paymentId));
            }
        }

        // Send email notification to user about enrollment status change
        if (enrollmentDetails.length > 0) {
            const enrollment = enrollmentDetails[0];
            const previousStatus = enrollment.status;

            // Only send email if status actually changed
            if (previousStatus !== status && enrollment.userEmail && enrollment.userName) {
                try {
                    let emailResult;

                    if (status === 'enrolled') {
                        // Send enrollment confirmation email
                        emailResult = await emailService.sendEnrollmentConfirmation(
                            enrollment.userEmail,
                            enrollment.userName,
                            enrollment.courseTitle || 'Course',
                            enrollment.intakeStartDate!
                        );

                        logger.info('Enrollment confirmation email sent:', {
                            userEmail: enrollment.userEmail,
                            userName: enrollment.userName,
                            courseName: enrollment.courseTitle,
                            previousStatus,
                            newStatus: status
                        });

                    } else if (status === 'cancelled') {
                        // Send enrollment cancellation email
                        emailResult = await emailService.send({
                            to: enrollment.userEmail,
                            subject: 'Enrollment Cancelled - Hope International',
                            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #dc2626;">Enrollment Cancelled</h2>
                  
                  <p>Dear ${enrollment.userName},</p>
                  
                  <p>We regret to inform you that your enrollment has been cancelled.</p>
                  
                  <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                    <h3 style="margin-top: 0; color: #1e293b;">Cancellation Details</h3>
                    <p><strong>Course:</strong> ${enrollment.courseTitle || 'Course'}</p>
                    <p><strong>Status:</strong> Cancelled</p>
                    ${cancelled_reason ? `<p><strong>Reason:</strong> ${cancelled_reason}</p>` : ''}
                  </div>
                  
                  <p>If you have any questions about this cancellation, please contact our admissions team.</p>
                  
                  <p>Best regards,<br>
                  Hope International Admissions Team</p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
                    <p>Hope International - Aged Care Training and Elderly Care Center</p>
                    <p>Kathmandu, Nepal</p>
                  </div>
                </div>
              `,
                        });

                        logger.info('Enrollment cancellation email sent:', {
                            userEmail: enrollment.userEmail,
                            userName: enrollment.userName,
                            courseName: enrollment.courseTitle,
                            cancellationReason: cancelled_reason,
                            previousStatus,
                            newStatus: status
                        });

                    } else if (status === 'completed') {
                        // Send course completion email with certificate
                        emailResult = await emailService.sendCertificateEmail(
                            enrollment.userEmail,
                            enrollment.userName,
                            enrollment.courseTitle || 'Course'
                        );

                        logger.info('Course completion email sent:', {
                            userEmail: enrollment.userEmail,
                            userName: enrollment.userName,
                            courseName: enrollment.courseTitle,
                            previousStatus,
                            newStatus: status
                        });
                    }

                    if (emailResult && !emailResult.success) {
                        logger.error('Failed to send enrollment status change email:', { description: emailResult.error });
                    }

                } catch (emailError) {
                    logger.error('Error sending enrollment status change email:', { description: emailError });
                    // Don't fail the status update if email fails, just log the error
                }
            } else {
                logger.info('No email sent for enrollment status change:', {
                    enrollmentId: id,
                    previousStatus,
                    newStatus: status,
                    statusChanged: previousStatus !== status,
                    hasUserEmail: !!enrollment.userEmail,
                    hasUserName: !!enrollment.userName
                });
            }
        }

        revalidatePath('/admin/enrollments');
        return {
            success: true,
            data: data[0],
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred while updating enrollment status.',
        };
    }
}

export async function adminEnrollmentListAll() {
    try {
        const data = await db
            .select({
                enrollment: enrollmentSchema,
                user: profileSchema,
                intake: intakeSchema,
                course: courseSchema,
                category: categoriesSchema,
            })
            .from(enrollmentSchema)
            .leftJoin(profileSchema, eq(enrollmentSchema.user_id, profileSchema.id))
            .leftJoin(intakeSchema, eq(enrollmentSchema.intake_id, intakeSchema.id))
            .leftJoin(courseSchema, eq(intakeSchema.course_id, courseSchema.id))
            .leftJoin(
                categoriesSchema,
                eq(courseSchema.category_id, categoriesSchema.id)
            );
        return { success: true, data };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export async function adminEnrollmentListAllByStatus(
    status: TypeEnrollmentStatus
) {
    try {
        const data = await db
            .select()
            .from(enrollmentSchema)
            .where(eq(enrollmentSchema.status, status));
        return { success: true, data };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export async function adminEnrollmentDeleteById(id: string) {
    try {
        const enrollment = await db
            .select()
            .from(enrollmentSchema)
            .where(eq(enrollmentSchema.id, id));

        const data = await db
            .delete(enrollmentSchema)
            .where(eq(enrollmentSchema.id, id))
            .returning();

        // Decrement total_registered in the intake
        if (enrollment[0].intake_id) {
            await db
                .update(intakeSchema)
                .set({
                    total_registered: sql`${intakeSchema.total_registered} - 1`,
                })
                .where(eq(intakeSchema.id, enrollment[0].intake_id));
        }

        revalidatePath('/admin/enrollments');
        return { success: true, data: data[0] };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
}

export const cachedAdminEnrollmentList = cache(adminEnrollmentList);
export const cachedAdminEnrollmentDetailsById = cache(adminEnrollmentDetailsById);
export const cachedAdminEnrollmentDetailsWithJoinsById = cache(
    adminEnrollmentDetailsWithJoinsById
);
export const cachedAdminEnrollmentListByUserId = cache(
    adminEnrollmentListByUserId
);
export const cachedAdminEnrollmentDetailsWithPaymentById = cache(
    adminEnrollmentDetailsWithPaymentById
);

export const cachedAdminEnrollmentListAll = cache(adminEnrollmentListAll);
export const cachedAdminEnrollmentListAllByStatus = cache(
    adminEnrollmentListAllByStatus
);
