// reset-db.ts
import 'dotenv/config';
import postgres from 'postgres';

async function resetDatabase() {
    const client = postgres(process.env.SUPABASE_DB_URL!);

    try {
        console.log('Connected to database');

        // Execute all cleanup operations in a transaction
        await client.begin(async tx => {
            // Drop all tables in public schema (only your application tables)
            console.log('Dropping all tables in public schema...');
            await tx.unsafe(`
        DO $$ 
        DECLARE 
          r RECORD; 
        BEGIN 
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
            EXECUTE 'DROP TABLE IF EXISTS public."' || r.tablename || '" CASCADE'; 
          END LOOP; 
        END $$;
      `);

            // Drop all sequences in public schema
            console.log('Dropping all sequences in public schema...');
            await tx.unsafe(`
        DO $$ 
        DECLARE 
          r RECORD; 
        BEGIN 
          FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP 
            EXECUTE 'DROP SEQUENCE IF EXISTS public."' || r.sequence_name || '" CASCADE'; 
          END LOOP; 
        END $$;
      `);

            // Drop all views in public schema
            console.log('Dropping all views in public schema...');
            await tx.unsafe(`
        DO $$ 
        DECLARE 
          r RECORD; 
        BEGIN 
          FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public') LOOP 
            EXECUTE 'DROP VIEW IF EXISTS public."' || r.table_name || '" CASCADE'; 
          END LOOP; 
        END $$;
      `);

            // Drop all functions in public schema only
            console.log('Dropping all functions in public schema...');
            await tx.unsafe(`
        DO $$ 
        DECLARE 
          r RECORD; 
        BEGIN 
          FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args 
                   FROM pg_proc 
                   WHERE pronamespace = 'public'::regnamespace) LOOP 
            EXECUTE 'DROP FUNCTION IF EXISTS public."' || r.proname || '"(' || r.args || ') CASCADE'; 
          END LOOP; 
        END $$;
      `);

            // Drop all custom types in public schema (including enums)
            console.log('Dropping all custom types in public schema...');
            await tx.unsafe(`
        DO $$ 
        DECLARE 
          r RECORD; 
        BEGIN 
          FOR r IN (SELECT typname 
                   FROM pg_type t 
                   JOIN pg_namespace n ON t.typnamespace = n.oid 
                   WHERE n.nspname = 'public' AND t.typtype != 'b') LOOP 
            EXECUTE 'DROP TYPE IF EXISTS public."' || r.typname || '" CASCADE'; 
          END LOOP; 
        END $$;
      `);

            // Drop all triggers on tables in public schema only
            console.log('Dropping all triggers in public schema...');
            await tx.unsafe(`
        DO $$ 
        DECLARE 
          r RECORD; 
        BEGIN 
          FOR r IN (SELECT tgname, tgrelid::regclass 
                   FROM pg_trigger t 
                   JOIN pg_class c ON t.tgrelid = c.oid 
                   JOIN pg_namespace n ON c.relnamespace = n.oid 
                   WHERE n.nspname = 'public' AND t.tgname NOT LIKE 'pg_%') LOOP 
            EXECUTE 'DROP TRIGGER IF EXISTS "' || r.tgname || '" ON ' || r.tgrelid::regclass || ' CASCADE'; 
          END LOOP; 
        END $$;
      `);

            // Clean drizzle migration tracking table
            console.log('Cleaning drizzle migration tracking...');
            await tx.unsafe(
                'DROP TABLE IF EXISTS drizzle.__drizzle_migrations CASCADE;'
            );
        });

        console.log('✅ Database reset completed successfully!');
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Confirm before running
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question(
    '⚠️  This will DELETE ALL DATA in your public schema. Are you sure? (type "YES" to confirm): ',
    async (answer: string) => {
        if (answer === 'YES') {
            await resetDatabase();
        } else {
            console.log('Database reset cancelled.');
        }
        readline.close();
    }
);
