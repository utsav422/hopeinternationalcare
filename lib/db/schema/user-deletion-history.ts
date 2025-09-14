// /lib/db/schema/user-deletion-history.ts
import { relations, sql } from 'drizzle-orm';
import {
    boolean,
    integer,
    pgPolicy,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';
import { authUsers, serviceRole } from 'drizzle-orm/supabase';

export const userDeletionHistory = pgTable(
    'user_deletion_history',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        user_id: uuid('user_id')
            .notNull()
            .references(() => authUsers.id),
        deleted_at: timestamp('deleted_at', { mode: 'string', withTimezone: true }).notNull(),
        deleted_by: uuid('deleted_by')
            .notNull()
            .references(() => authUsers.id),
        restored_at: timestamp('restored_at', { mode: 'string', withTimezone: true }),
        restored_by: uuid('restored_by').references(() => authUsers.id),
        deletion_reason: text('deletion_reason').notNull(),
        scheduled_deletion_date: timestamp('scheduled_deletion_date', { mode: 'string', withTimezone: true }),
        email_notification_sent: boolean('email_notification_sent').notNull().default(false),
        restoration_count: integer('restoration_count').notNull().default(0),
        created_at: timestamp('created_at', { mode: 'string', withTimezone: true })
            .notNull()
            .default(sql`now()`),
        updated_at: timestamp('updated_at', { mode: 'string', withTimezone: true })
            .notNull()
            .default(sql`now()`),
    },
    (table) => [
        pgPolicy('admin can manage user deletion history', {
            as: 'permissive',
            for: 'all',
            to: serviceRole,
            using: sql`(auth.jwt() ->> 'role') = 'service_role'`,
            withCheck: sql`(auth.jwt() ->> 'role') = 'service_role'`,
        }),
    ]
);

export const userDeletionHistoryRelations = relations(userDeletionHistory, ({ one }) => ({
    user: one(authUsers, {
        fields: [userDeletionHistory.user_id],
        references: [authUsers.id],
    }),
    deletedBy: one(authUsers, {
        fields: [userDeletionHistory.deleted_by],
        references: [authUsers.id],
    }),
    restoredBy: one(authUsers, {
        fields: [userDeletionHistory.restored_by],
        references: [authUsers.id],
    }),
}));
