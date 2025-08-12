// /server-action/user/enrollments.ts
'use server';

import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer';
import { db } from '@/lib/db/drizzle';
import { EnrollmentRequestSchema } from '@/lib/db/drizzle-zod-schema/enrollments';
import { enrollments } from '@/lib/db/schema/enrollments';
import { EnrollmentStatus } from '@/lib/db/schema/enums';
import { intakes } from '@/lib/db/schema/intakes';
import { profiles } from '@/lib/db/schema/profiles';
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
        error: parsed.error.errors.map((e) => e.message).join(', '),
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

    // Fetch user and admins for email notification
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId));

    const admins = await db
      .select({ email: profiles.email })
      .from(profiles)
      .where(eq(profiles.role, 'service_role')); // Assuming 'service_role' is for admins

    if (userProfile && admins.length) {
      // Send emails...
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER ?? 'example',
          pass: process.env.SMTP_PASS ?? 'example',
        },
      });

      // Email to user
      await transporter.sendMail({
        from: process.env.SMTP_USER ?? 'example',
        to: userProfile.email,
        subject: 'Enrollment Request Received',
        text: `Hi ${userProfile.full_name}, your enrollment request has been received for intake ID: ${intakeId}.`,
      });

      // Email to admins
      await transporter.sendMail({
        from: process.env.SMTP_USER ?? 'example',
        to: admins.map((a) => a.email).join(','),
        subject: 'New Enrollment Request',
        text: `${userProfile.full_name} (${userProfile.email}) requested enrollment for intake ID: ${intakeId}.`,
      });
    } else {
      logger.warn(
        'Could not fetch user profile or admin emails for notification.',
        {
          userId,
          userProfile: !!userProfile,
          adminsCount: admins.length,
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
