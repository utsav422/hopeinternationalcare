import { paymentMethod, paymentStatus } from './enums';
// /lib/db/schema/payments.ts

import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  numeric,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { serviceRole } from 'drizzle-orm/supabase';
import { enrollments } from './enrollments';

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    enrollment_id: uuid('enrollment_id').references(() => enrollments.id),
    amount: numeric('amount', { mode: 'number' }).notNull(),
    status: paymentStatus('status').notNull().default('pending'),
    method: paymentMethod('method').notNull().default('cash'),
    remarks: varchar('remarks'),
    is_refunded: boolean('is_refunded').default(false),
    refunded_amount: numeric('refunded_amount', { mode: 'number' }),
    refunded_at: timestamp('refunded_at', { mode: 'string' }),
    paid_at: timestamp('paid_at', { mode: 'string' }),
    created_at: timestamp('created_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    pgPolicy('users can create their own payments', {
      as: 'permissive',
      for: 'insert',
      to: 'public',
      withCheck: sql`(auth.jwt() ->> 'role') = 'authenticated' AND ${table.enrollment_id} IN (
            SELECT id FROM enrollments WHERE user_id = auth.uid()
          )`,
    }),
    pgPolicy('users can view their own payments', {
      as: 'permissive',
      for: 'select',
      to: 'public',
      using: sql`(auth.jwt() ->> 'role') = 'authenticated' AND ${table.enrollment_id} IN (
            SELECT id FROM enrollments WHERE user_id = auth.uid()
          )`,
    }),
    pgPolicy('admin can manage payments', {
      as: 'permissive',
      for: 'all',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
      withCheck: sql`true`,
    }),
  ]
);

export const paymentRelations = relations(payments, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [payments.enrollment_id],
    references: [enrollments.id],
  }),
}));

// export type ISelectPayment = typeof payments.$inferSelect;
// export type IInsertPayment = typeof payments.$inferInsert;
