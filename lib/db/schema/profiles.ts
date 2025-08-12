// /lib/db/schema/profiles.ts
import { relations, sql } from 'drizzle-orm';
import {
  pgPolicy,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { authUsers, serviceRole } from 'drizzle-orm/supabase';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id')
      .primaryKey()
      .references(() => authUsers.id),
    full_name: varchar('full_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    role: varchar('role').default('authenticated'),
    created_at: timestamp('created_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
    updated_at: timestamp('updated_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
  },
  (table) => [
    pgPolicy('anyone can insert profile', {
      as: 'permissive',
      for: 'insert',
      to: 'public',
      withCheck: sql`true`,
    }),
    pgPolicy('User can view own profile', {
      as: 'permissive',
      for: 'select',
      to: 'public',
      using: sql`auth.uid() = ${table.id}`,
    }),
    pgPolicy('User can update own profile', {
      as: 'permissive',
      for: 'update',
      to: 'public',
      using: sql`auth.uid() = ${table.id}`,
    }),
    pgPolicy('admin can manage profile', {
      as: 'permissive',
      for: 'all',
      to: serviceRole,
      using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
      withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
    }),
  ]
);

export const profileRelations = relations(profiles, ({ one }) => ({
  authUser: one(authUsers, {
    fields: [profiles.id],
    references: [authUsers.id],
  }),
}));
