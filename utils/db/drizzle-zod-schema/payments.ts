import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { TypeEnrollmentStatus, TypePaymentStatus } from '../schema/enums';
import { payments } from './../schema/payments';
export const ZodPaymentInsertSchema = createInsertSchema(payments);

export const ZodPaymentSelectSchema = createSelectSchema(payments);
export type ZodInsertPaymentType = typeof ZodPaymentInsertSchema._zod.input;
export type ZodSelectPaymentType = typeof ZodPaymentSelectSchema._zod.input;
export type PaymentDetailsType = {
  id: string;
  amount: number;
  status: TypePaymentStatus;
  paid_at: string | null;
  method: string | null;
  remarks: string | null;
  is_refunded: boolean | null;

  enrollment_id: string | null;
  enrolled_at: string | null;
  enrollment_status: TypeEnrollmentStatus | null;

  user_id: string | null;
  userEmail: string | null;
  userName: string | null;

  courseId: string | null;
  courseTitle: string | null;
};
