import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: ['./lib/db/schema/**.ts'],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL ?? 'create-newone',
  },
  verbose: true,
  strict: true,
});
