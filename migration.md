# Migration Guide

This document provides instructions on how to generate and apply database migrations using Drizzle ORM.

## Generating Migrations

When you make changes to the database schema (e.g., modifying tables in `lib/db/schema/*.ts`), you need to generate a new migration file.

1.  **Run the migration generation command:**

    ```bash
    npm run db:generate
    ```

    This command will compare the current state of your schema with the database and create a new SQL migration file in the `drizzle` directory.

2.  **Review the generated migration file:**

    It's important to review the generated SQL file to ensure it accurately reflects the changes you intended to make.

## Applying Migrations

Once you have a new migration file, you need to apply it to the database.

1.  **Run the migration command:**

    ```bash
    npm run db:migrate
    ```

    This command will apply any pending migrations to the database.

## Pushing changes to Supabase

After generating and applying migrations locally, you need to push the changes to your Supabase project.

1.  **Push database changes:**
    ```bash
    npm run db:push
    ```
    This command pushes the local database schema changes to the remote Supabase database.