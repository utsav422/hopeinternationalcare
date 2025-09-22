import type { InferSelectModel } from 'drizzle-orm';
import type { payments } from '@/lib/db/schema/payments';


// Base types
export type PaymentBase = InferSelectModel<typeof payments>;


// User payment list item
export interface UserPaymentListItem {
  paymentId: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  intake_id: string | null;
  courseId: string | null;
  courseName: string | null;
}

export type { ApiResponse } from '../..';

// Payment creation data
export interface CreatePaymentData {
  enrollment_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id?: string;
  metadata?: Record<string, any>;
  userId: string;
}

// User payment history
export interface UserPaymentHistory {
  paymentId: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  intake_id: string | null;
  courseId: string | null;
  courseName: string | null;
}

