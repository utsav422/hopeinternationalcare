import { sql } from 'drizzle-orm';
import {
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { serviceRole } from 'drizzle-orm/supabase';

export const customerContactRequests = pgTable(
  'customer_contact_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    message: varchar('message', { length: 1000 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending').notNull(), // e.g., 'pending', 'resolved', 'closed'
    created_at: timestamp('created_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
    updated_at: timestamp('updated_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    pgPolicy('anyone can insert contact requests', {
      as: 'permissive',
      for: 'insert',
      to: 'public',
      withCheck: sql`true`,
    }),
    pgPolicy('admin can view all contact requests', {
      as: 'permissive',
      for: 'select',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
    pgPolicy('admin can update contact requests', {
      as: 'permissive',
      for: 'update',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
      withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
    pgPolicy('admin can delete contact requests', {
      as: 'permissive',
      for: 'delete',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
  ],
);
