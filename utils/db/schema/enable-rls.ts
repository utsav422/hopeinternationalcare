import { sql } from 'drizzle-orm';

export const enableRLS = (tableName: string) => sql`
  ALTER TABLE ${sql.raw(tableName)} ENABLE ROW LEVEL SECURITY;
`;
