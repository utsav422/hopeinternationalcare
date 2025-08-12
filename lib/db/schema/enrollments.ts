import { relations, sql } from 'drizzle-orm';
import {
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { serviceRole } from 'drizzle-orm/supabase';
import { enrollmentStatus } from './enums';
import { intakes } from './intakes';
import { profiles } from './profiles';

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => profiles.id),
    intake_id: uuid('intake_id').references(() => intakes.id),
    status: enrollmentStatus('status').notNull().default('requested'),
    notes: varchar('notes'),
    enrollment_date: timestamp('enrollment_date', {
      mode: 'string',
    }).defaultNow(),
    cancelled_reason: varchar('cancelled_reason'),
    created_at: timestamp('created_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
    updated_at: timestamp('updated_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    pgPolicy('authenticated users can view own enrollments', {
      as: 'permissive',
      for: 'select',
      to: 'public',
      using: sql`(auth.jwt() ->> 'role') = 'authenticated' AND ${table.user_id} = auth.uid()`,
    }),
    pgPolicy('authenticated users can create enrollments', {
      as: 'permissive',
      for: 'insert',
      to: 'public',
      withCheck: sql`(auth.jwt() ->> 'role') = 'authenticated'`,
    }),
    pgPolicy('admin can manage courses', {
      as: 'permissive',
      for: 'all',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
      withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
  ]
);

// Optional: Define relationships
export const enrollmentRelations = relations(enrollments, ({ one }) => ({
  user: one(profiles, {
    fields: [enrollments.user_id],
    references: [profiles.id],
  }),
  intake: one(intakes, {
    fields: [enrollments.intake_id],
    references: [intakes.id],
  }),
}));
