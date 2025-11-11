import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL ?? 'example';

const client = postgres(SUPABASE_DB_URL);
export const db = drizzle(client, { schema });
