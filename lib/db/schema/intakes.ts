import { relations, sql } from 'drizzle-orm';
import {
    boolean,
    integer,
    pgPolicy,
    pgTable,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core';
import { serviceRole } from 'drizzle-orm/supabase';
import { courses } from './courses';
import { enrollments } from './enrollments';

export const intakes = pgTable(
    'intakes',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        course_id: uuid('course_id').references(() => courses.id),
        start_date: timestamp('start_date', { mode: 'string' }).notNull(),
        end_date: timestamp('end_date', { mode: 'string' }).notNull(),
        capacity: integer('capacity').notNull().default(20),
        is_open: boolean('is_open').default(true),
        total_registered: integer('total_registered').default(0).notNull(),
        created_at: timestamp('created_at', { mode: 'string' })
            .notNull()
            .default(sql`now()`),
        updated_at: timestamp('updated_at', { mode: 'string' })
            .notNull()
            .default(sql`now()`),
    },
    _t => [
        pgPolicy('anyone can read intakes', {
            as: 'permissive',
            for: 'select',
            to: 'public',
            using: sql`true`,
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
export const intakeRelations = relations(intakes, ({ one, many }) => ({
    course: one(courses, {
        fields: [intakes.course_id],
        references: [courses.id],
    }),
    enrollments: many(enrollments),
}));
