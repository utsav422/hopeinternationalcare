import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { enrollments } from '../schema/enrollments';

// Zod schema for inserting data into the enrollments table
export const ZodEnrollmentInsertSchema = createInsertSchema(enrollments);

// Zod schema for selecting data from the enrollments table
export type ZodEnrollmentInsertType =
  typeof ZodEnrollmentInsertSchema._zod.input;

// Zod schema for selecting data from the enrollments table
export const ZodEnrollmentSelectSchema = createSelectSchema(enrollments);
export type ZodEnrollmentSelectType =
  typeof ZodEnrollmentSelectSchema._zod.input;

// Schema for validating enrollment requests from the client (used in server actions)
// This includes courseId which is used to find the correct intake, but not directly stored in the enrollments table.
export const EnrollmentRequestSchema = z.object({
  courseId: z.string().uuid('Invalid course ID.'),
  intakeId: z.string().uuid('Invalid intake ID.'),
  userId: z.string().uuid('Invalid user ID.').optional(), // userId is derived from auth, so optional in request
});

export type EnrollmentRequestType = z.infer<typeof EnrollmentRequestSchema>;
