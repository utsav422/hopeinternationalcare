// /server-action/user/enrollments.ts
'use server';

import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer';
import { db } from '@/utils/db/drizzle';
import { enrollments } from '@/utils/db/schema/enrollments';
import { EnrollmentStatus } from '@/utils/db/schema/enums';
import { profiles } from '@/utils/db/schema/profiles';

type EnrollmentFormInput = typeof enrollments.$inferInsert;

export async function createEnrollment(input: EnrollmentFormInput) {
  // Validate required fields
  if (!(input.user_id && input.intake_id)) {
    throw new Error('Missing required fields');
  }

  const [newEnrollment] = await db
    .insert(enrollments)
    .values({
      ...input,
      status: EnrollmentStatus.requested,
    })
    .returning();

  // Fetch user and admins
  const [user] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, input.user_id));

  const admins = await db
    .select({ email: profiles.email })
    .from(profiles)
    .where(eq(profiles.role, 'admin'));

  if (!(user && admins.length)) {
    throw new Error('User/admin fetch failed');
  }

  // Send emails...
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER ?? 'example',
      pass: process.env.SMTP_PASS ?? 'example',
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER ?? 'example',
    to: user.email,
    subject: 'Enrollment Request Received',
    text: `Hi ${user.full_name}, your enrollment request has been received.`,
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER ?? 'example',
    to: admins.map((a) => a.email).join(','),
    subject: 'New Enrollment Request',
    text: `${user.full_name} requested enrollment for intake ID: ${input.intake_id}`,
  });

  return newEnrollment;
}
