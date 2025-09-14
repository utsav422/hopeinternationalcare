'use server';

import { cache } from 'react';
import { createAdminSupabaseClient } from '@/utils/supabase/admin';
import { requireAdmin } from '@/utils/auth-guard';
import { db } from '@/lib/db/drizzle';
import { enrollments } from '@/lib/db/schema/enrollments';
import { payments } from '@/lib/db/schema/payments';
import { refunds } from '@/lib/db/schema/refunds';
import { courses } from '@/lib/db/schema/courses';
import { intakes } from '@/lib/db/schema/intakes';
import { profiles } from '@/lib/db/schema/profiles';
import { eq, count, sum, sql, isNull, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logger } from '@/utils/logger';

export const adminUserCreate = async (formData: FormData) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();
        const adminAuthClient = supabaseAdmin.auth.admin;
        const email = formData.get('email')?.toString();
        const full_name = formData.get('full_name')?.toString() ?? 'superadmin';
        const phone = formData.get('phone')?.toString() ?? '+9779800000';
        const role = 'authenticated';

        const password = formData.get('password')?.toString();

        if (!(email && password)) {
            return { success: false, error: 'Email and password are required' };
        }

        const {
            data: { user },
            error,
        } = await adminAuthClient.createUser({
            email,
            password,
            user_metadata: { role, full_name, phone },
            role,
            email_confirm: true,
        });

        if (error) {
            return { success: false, error: error.message };
        }
        const id = user?.id;
        if (id) {
            const { data, error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id,
                    full_name,
                    email,
                    phone,
                    role,
                })
                .select().single();
            if (profileError) {
                logger.error('Error creating user profile:', { email, error: profileError.message });
                return { success: false, error: profileError.message };
            }

            revalidatePath('/admin/users');
            logger.info('User created successfully:', { userId: data.id, email });
            return { success: true, data: data };
        }
        logger.error('User not created - no user data returned');
        return { success: false, error: 'User not created' };
    } catch (error) {
        const e = error as Error;
        logger.error('Error creating user:', { description: e.message });
        return { success: false, error: e.message };
    }
};

export const adminUserList = async (page?: number, pageSize?: number) => {
    try {
        await requireAdmin();

        const currentPage = page || 1;
        const currentPageSize = pageSize || 10;
        const offset = (currentPage - 1) * currentPageSize;

        // Get active (non-deleted) users from the profile table
        const activeUsers = await db
            .select({
                id: profiles.id,
                full_name: profiles.full_name,
                email: profiles.email,
                phone: profiles.phone,
                role: profiles.role,
                created_at: profiles.created_at,
                updated_at: profiles.updated_at,
            })
            .from(profiles)
            .where(isNull(profiles.deleted_at))
            .limit(currentPageSize)
            .offset(offset)
            .orderBy(profiles.created_at);

        // Get a total count of active users
        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(profiles)
            .where(isNull(profiles.deleted_at));

        const total = totalResult[0]?.count || 0;

        // Fetch required auth user records efficiently
        const supabaseAdmin = createAdminSupabaseClient();
        const targetIds = new Set(activeUsers.map(u => u.id));
        const authInfoById = new Map<string, { email_confirmed_at?: string | null; confirmation_sent_at?: string | null; confirmed_at?: string | null }>();

        // Iterate through auth users pages until we find all target IDs or exhaust the list
        // Use reasonable perPage to balance payload size and latency
        const perPage = 200;
        let pageIdx = 1;
        const maxPages = 50; // safety cap to avoid unbounded loops on very large datasets
        let done = false;
        while (!done && pageIdx <= maxPages && authInfoById.size < targetIds.size) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: pageIdx, perPage });
            if (error) {
                logger.error('adminUserList: error listing auth users', { page: pageIdx, error: error.message });
                break; // fall back to whatever we've collected so far
            }
            const users = data?.users || [];
            for (const u of users) {
                if (targetIds.has(u.id)) {
                    authInfoById.set(u.id, {
                        email_confirmed_at: (u as any).email_confirmed_at ?? null,
                        confirmation_sent_at: (u as any).confirmation_sent_at ?? null,
                        confirmed_at: (u as any).confirmed_at ?? null,
                    });
                }
            }
            if (users.length < perPage) {
                done = true; // no more pages
            } else if (authInfoById.size < targetIds.size) {
                pageIdx += 1;
            } else {
                done = true;
            }
        }

        const updatedActiveUser = activeUsers.map(user => {
            const auth = authInfoById.get(user.id);
            return {
                ...user,
                email_confirmed_at: auth?.email_confirmed_at,
                confirmation_sent_at: auth?.confirmation_sent_at,
                confirmed_at: auth?.confirmed_at,
            };
        });

        return {
            success: true,
            data: {
                users: updatedActiveUser,
                total,
                page: currentPage,
                pageSize: currentPageSize,
                totalPages: Math.ceil(total / currentPageSize),
            }
        };
    } catch (error) {
        const e = error as Error;
        logger.error('Error in adminUserList', { error: e.message });
        return { success: false, error: e.message };
    }
};

export const adminUserListAll = async () => {
    try {
        await requireAdmin();

        // Get all active (non-deleted) users from profiles table
        const activeUsers = await db
            .select({
                id: profiles.id,
                full_name: profiles.full_name,
                email: profiles.email,
                phone: profiles.phone,
                role: profiles.role,
                created_at: profiles.created_at,
                updated_at: profiles.updated_at,
            })
            .from(profiles)
            .where(isNull(profiles.deleted_at))
            .orderBy(profiles.created_at);

        return {
            success: true,
            data: {
                users: activeUsers,
                total: activeUsers.length,
            }
        };
    } catch (error) {
        const e = error as Error;
        logger.error('Error in adminUserListAll', { error: e.message });
        return { success: false, error: e.message };
    }
};

export const adminUserDeleteById = async (id: string) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();
        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) {
            logger.error('Error deleting user:', { userId: id, error: error.message });
            return { success: false, error: error.message };
        }

        await supabaseAdmin.from('profiles').delete().eq('id', id);
        revalidatePath('/admin/users');
        logger.info('User deleted successfully:', { userId: id });
        return { success: true, data };
    } catch (error) {
        const e = error as Error;
        logger.error('Error deleting user:', { userId: id, error: e.message });
        return { success: false, error: e.message };
    }
};

export const adminUserDetailsById = async (id: string) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true, data };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
};

export const adminUserDetailsWithProfileById = async (id: string) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();

        // Get user details
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userError) {
            return { success: false, error: userError.message };
        }

        // Get profile details (only active users)
        const profileData = await db
            .select()
            .from(profiles)
            .where(and(eq(profiles.id, id), isNull(profiles.deleted_at)))
            .limit(1);

        if (profileData.length === 0) {
            return { success: false, error: 'User not found or has been deleted' };
        }

        return {
            success: true,
            data: {
                ...userData,
                profile: profileData[0]
            }
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
};

export const adminUserDetailsWithEnrollmentsById = async (id: string) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();

        // Get user details
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userError) {
            return { success: false, error: userError.message };
        }

        // Get user enrollments with course and intake details
        const userEnrollments = await db
            .select({
                id: enrollments.id,
                status: enrollments.status,
                created_at: enrollments.created_at,
                notes: enrollments.notes,
                course_title: courses.title,
                course_id: courses.id,
                intake_id: intakes.id,
                intake_start_date: intakes.start_date,
                intake_end_date: intakes.end_date,
            })
            .from(enrollments)
            .leftJoin(intakes, eq(enrollments.intake_id, intakes.id))
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .where(eq(enrollments.user_id, id));

        return {
            success: true,
            data: {
                ...userData,
                enrollments: userEnrollments
            }
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
};

export const adminUserDetailsWithPaymentsById = async (id: string) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();

        // Get user details
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userError) {
            return { success: false, error: userError.message };
        }

        // Get user payments with enrollment and course details
        const userPayments = await db
            .select({
                id: payments.id,
                amount: payments.amount,
                status: payments.status,
                paid_at: payments.paid_at,
                created_at: payments.created_at,
                enrollment_id: enrollments.id,
                course_title: courses.title,
                course_id: courses.id,
            })
            .from(payments)
            .leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id))
            .leftJoin(intakes, eq(enrollments.intake_id, intakes.id))
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .where(eq(enrollments.user_id, id));

        return {
            success: true,
            data: {
                ...userData,
                payments: userPayments
            }
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
};

export const adminUserDetailsWithRefundsById = async (id: string) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();

        // Get user details
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userError) {
            return { success: false, error: userError.message };
        }

        // Get user refunds with payment and course details
        const userRefunds = await db
            .select({
                id: refunds.id,
                amount: refunds.amount,
                reason: refunds.reason,
                created_at: refunds.created_at,
                payment_id: payments.id,
                payment_amount: payments.amount,
                course_title: courses.title,
                course_id: courses.id,
            })
            .from(refunds)
            .leftJoin(payments, eq(refunds.payment_id, payments.id))
            .leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id))
            .leftJoin(intakes, eq(enrollments.intake_id, intakes.id))
            .leftJoin(courses, eq(intakes.course_id, courses.id))
            .where(eq(enrollments.user_id, id));

        return {
            success: true,
            data: {
                ...userData,
                refunds: userRefunds
            }
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
};

export const adminUserDetailsWithAllById = async (id: string) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();

        // Get user details
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userError) {
            return { success: false, error: userError.message };
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profileError) {
            return { success: false, error: profileError.message };
        }

        // Get all related data
        const [userEnrollments, userPayments, userRefunds] = await Promise.all([
            db
                .select({
                    id: enrollments.id,
                    status: enrollments.status,
                    created_at: enrollments.created_at,
                    notes: enrollments.notes,
                    course_title: courses.title,
                    course_id: courses.id,
                    intake_id: intakes.id,
                    intake_start_date: intakes.start_date,
                    intake_end_date: intakes.end_date,
                })
                .from(enrollments)
                .leftJoin(intakes, eq(enrollments.intake_id, intakes.id))
                .leftJoin(courses, eq(intakes.course_id, courses.id))
                .where(eq(enrollments.user_id, id)),

            db
                .select({
                    id: payments.id,
                    amount: payments.amount,
                    status: payments.status,
                    paid_at: payments.paid_at,
                    created_at: payments.created_at,
                    enrollment_id: enrollments.id,
                    course_title: courses.title,
                    course_id: courses.id,
                })
                .from(payments)
                .leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id))
                .leftJoin(intakes, eq(enrollments.intake_id, intakes.id))
                .leftJoin(courses, eq(intakes.course_id, courses.id))
                .where(eq(enrollments.user_id, id)),

            db
                .select({
                    id: refunds.id,
                    amount: refunds.amount,
                    reason: refunds.reason,
                    created_at: refunds.created_at,
                    payment_id: payments.id,
                    payment_amount: payments.amount,
                    course_title: courses.title,
                    course_id: courses.id,
                })
                .from(refunds)
                .leftJoin(payments, eq(refunds.payment_id, payments.id))
                .leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id))
                .leftJoin(intakes, eq(enrollments.intake_id, intakes.id))
                .leftJoin(courses, eq(intakes.course_id, courses.id))
                .where(eq(enrollments.user_id, id))
        ]);

        return {
            success: true,
            data: {
                ...userData,
                profile: profileData,
                enrollments: userEnrollments,
                payments: userPayments,
                refunds: userRefunds
            }
        };
    } catch (error) {
        const e = error as Error;
        return { success: false, error: e.message };
    }
};

export const adminUserAnalyticsById = async (id: string) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();

        // Get user details
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
        if (userError) {
            return { success: false, error: userError.message };
        }

        // Get profile data
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (profileError) {
            return { success: false, error: profileError.message };
        }

        // Get analytics data
        const [enrollmentStats, paymentStats, refundStats] = await Promise.all([
            // Enrollment statistics
            db
                .select({
                    total: count(),
                    requested: count(sql`CASE WHEN ${enrollments.status} = 'requested' THEN 1 END`),
                    enrolled: count(sql`CASE WHEN ${enrollments.status} = 'enrolled' THEN 1 END`),
                    completed: count(sql`CASE WHEN ${enrollments.status} = 'completed' THEN 1 END`),
                    cancelled: count(sql`CASE WHEN ${enrollments.status} = 'cancelled' THEN 1 END`),
                })
                .from(enrollments)
                .where(eq(enrollments.user_id, id)),

            // Payment statistics
            db
                .select({
                    total: count(),
                    totalAmount: sum(payments.amount),
                    pending: count(sql`CASE WHEN ${payments.status} = 'pending' THEN 1 END`),
                    completed: count(sql`CASE WHEN ${payments.status} = 'completed' THEN 1 END`),
                    failed: count(sql`CASE WHEN ${payments.status} = 'failed' THEN 1 END`),
                    cancelled: count(sql`CASE WHEN ${payments.status} = 'cancelled' THEN 1 END`),
                })
                .from(payments)
                .leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id))
                .where(eq(enrollments.user_id, id)),

            // Refund statistics
            db
                .select({
                    total: count(),
                    totalAmount: sum(refunds.amount),
                })
                .from(refunds)
                .leftJoin(payments, eq(refunds.payment_id, payments.id))
                .leftJoin(enrollments, eq(payments.enrollment_id, enrollments.id))
                .where(eq(enrollments.user_id, id))
        ]);

        return {
            success: true,
            data: {
                user: userData,
                profile: profileData,
                analytics: {
                    enrollments: enrollmentStats[0] || {
                        total: 0,
                        requested: 0,
                        enrolled: 0,
                        completed: 0,
                        cancelled: 0,
                    },
                    payments: paymentStats[0] || {
                        total: 0,
                        totalAmount: 0,
                        pending: 0,
                        completed: 0,
                        failed: 0,
                        cancelled: 0,
                    },
                    refunds: refundStats[0] || {
                        total: 0,
                        totalAmount: 0,
                    },
                }
            }
        };
    } catch (error) {
        const e = error as Error;
        logger.error('Error fetching user analytics:', { userId: id, error: e.message });
        return { success: false, error: e.message };
    }
};

export const adminUserUpdateById = async (id: string, formData: FormData) => {
    try {
        await requireAdmin();
        const supabaseAdmin = createAdminSupabaseClient();

        const full_name = formData.get('full_name')?.toString();
        const email = formData.get('email')?.toString();
        const phone = formData.get('phone')?.toString();
        const role = formData.get('role')?.toString() || 'authenticated';

        if (!email) {
            return { success: false, error: 'Email is required' };
        }

        // Update user metadata
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.updateUserById(id, {
            email,
            user_metadata: { full_name, phone, role },
        });

        if (userError) {
            return { success: false, error: userError.message };
        }

        // Update profile
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                full_name,
                email,
                phone,
                role,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (profileError) {
            return { success: false, error: profileError.message };
        }

        revalidatePath('/admin/users');
        return {
            success: true,
            data: {
                user: userData,
                profile: profileData,
            },
        };
    } catch (error) {
        const e = error as Error;
        logger.error('Error updating user:', { userId: id, error: e.message });
        return { success: false, error: e.message };
    }
};

// Cached versions using React cache
export const cachedAdminUserList = cache(adminUserList);
export const cachedAdminUserListAll = cache(adminUserListAll);
export const cachedAdminUserDetailsById = cache(adminUserDetailsById);
export const cachedAdminUserDetailsWithProfileById = cache(adminUserDetailsWithProfileById);
export const cachedAdminUserDetailsWithEnrollmentsById = cache(adminUserDetailsWithEnrollmentsById);
export const cachedAdminUserDetailsWithPaymentsById = cache(adminUserDetailsWithPaymentsById);
export const cachedAdminUserDetailsWithRefundsById = cache(adminUserDetailsWithRefundsById);
export const cachedAdminUserDetailsWithAllById = cache(adminUserDetailsWithAllById);
export const cachedAdminUserAnalyticsById = cache(adminUserAnalyticsById);
