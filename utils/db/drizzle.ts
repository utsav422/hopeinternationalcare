import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL ?? 'example';

const client = postgres(SUPABASE_DB_URL);
export const db = drizzle({ client });
