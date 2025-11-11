import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { courseCategories } from './schema/course-categories';
import { courses } from './schema/courses';
import { customerContactRequests } from './schema/customer-contact-requests';
import { enableRLS } from './schema/enable-rls';
import { enrollments } from './schema/enrollments';
import { intakes } from './schema/intakes';
import { manageUpdatedAt } from './schema/manage-updated-at';
import { payments } from './schema/payments';
import { profiles } from './schema/profiles';
import { refunds } from './schema/refunds';
import { updatedAt } from './schema/utils';

const tables = [
    {
        name: 'profiles',
        columns: profiles,
    },
    {
        name: 'course_categories',
        columns: courseCategories,
    },
    {
        name: 'courses',
        columns: courses,
    },
    {
        name: 'intakes',
        columns: intakes,
    },
    {
        name: 'enrollments',
        columns: enrollments,
    },
    {
        name: 'payments',
        columns: payments,
    },
    {
        name: 'refunds',
        columns: refunds,
    },
    {
        name: 'customer_contact_requests',
        columns: customerContactRequests,
    },
];

const main = async () => {
    const connectionString = process.env.SUPABASE_DB_URL;
    if (!connectionString) {
        throw new Error(
            'SUPABASE_DB_URL is not defined in the environment variables.'
        );
    }
    const client = postgres(connectionString, { max: 1 });
    const db = drizzle(client);

    try {
        process.stdout.write('Seeding database...\n');

        await db.execute(updatedAt);

        const setupPromises = tables.flatMap(table => [
            db.execute(manageUpdatedAt(table.name)),
            db.execute(enableRLS(table.name)),
        ]);

        await Promise.all(setupPromises);

        process.stdout.write('Database seeded successfully!\n');
        process.exit(0);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        process.stderr.write(`Error seeding database: ${errorMessage}\n`);
        process.exit(1);
    }
};

main();
