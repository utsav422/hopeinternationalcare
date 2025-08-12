// /lib/db/schema/refunds.ts

import { relations, sql } from 'drizzle-orm';
import {
  numeric,
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { serviceRole } from 'drizzle-orm/supabase';
import { enrollments } from './enrollments';
import { payments } from './payments';
import { profiles } from './profiles';

export const refunds = pgTable(
  'refunds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    payment_id: uuid('payment_id').references(() => payments.id),
    enrollment_id: uuid('enrollment_id').references(() => enrollments.id),
    user_id: uuid('user_id').references(() => profiles.id),
    reason: varchar('reason').notNull(),
    amount: numeric('amount', { mode: 'number' }).notNull(),
    created_at: timestamp('created_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
    updated_at: timestamp('updated_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    pgPolicy('users can create their own refund requests', {
      as: 'permissive',
      for: 'insert',
      to: 'public',
      withCheck: sql`(auth.jwt() ->> 'role') = 'authenticated' AND ${table.user_id} = auth.uid()`,
    }),
    pgPolicy('users can view their own refund requests', {
      as: 'permissive',
      for: 'select',
      to: 'public',
      using: sql`(auth.jwt() ->> 'role') = 'authenticated' AND ${table.user_id} = auth.uid()`,
    }),
    pgPolicy('admin can manage intakes', {
      as: 'permissive',
      for: 'all',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
      withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
  ]
);
export const refundRelations = relations(refunds, ({ one }) => ({
  payment: one(payments, {
    fields: [refunds.payment_id],
    references: [payments.id],
  }),
  enrollment: one(enrollments, {
    fields: [refunds.enrollment_id],
    references: [enrollments.id],
  }),
  user: one(profiles, {
    fields: [refunds.user_id],
    references: [profiles.id],
  }),
}));

// export type ISelectRefund = typeof refunds.$inferSelect;
// export type IInsertRefund = typeof refunds.$inferInsert;
