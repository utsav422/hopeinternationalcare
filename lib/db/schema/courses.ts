import { relations, sql } from 'drizzle-orm';
import {
    integer,
    numeric,
    pgPolicy,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { serviceRole } from 'drizzle-orm/supabase';
import { affiliations } from './affiliations';
import { courseCategories } from './course-categories';
import { durationType } from './enums';
import { intakes } from './intakes';

export const courses = pgTable(
    'courses',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        category_id: uuid('category_id').references(() => courseCategories.id),
        affiliation_id: uuid('affiliation_id').references(
            () => affiliations.id
        ),
        title: varchar('title', { length: 255 }).notNull(),
        slug: varchar('slug', { length: 255 }).notNull().unique(),
        courseHighlights: text('course_highlights'),
        courseOverview: text('course_overview'),
        image_url: varchar('image_url'),
        level: integer('level').notNull().default(1),
        duration_type: durationType('duration_type').notNull().default('month'),
        duration_value: integer('duration_value').notNull().default(3),
        price: numeric('price', { mode: 'number' }).notNull(),
        created_at: timestamp('created_at', { mode: 'string' })
            .notNull()
            .default(sql`now()`),
        updated_at: timestamp('updated_at', { mode: 'string' })
            .notNull()
            .default(sql`now()`),
    },
    _t => [
        pgPolicy('anyone can read courses', {
            as: 'permissive',
            for: 'select',
            to: 'public',
            using: sql`true`,
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

export const courseRelations = relations(courses, ({ one, many }) => ({
    category: one(courseCategories, {
        fields: [courses.category_id],
        references: [courseCategories.id],
    }),
    affiliation: one(affiliations, {
        fields: [courses.affiliation_id],
        references: [affiliations.id],
    }),
    intakes: many(intakes),
}));
