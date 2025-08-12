import { sql } from 'drizzle-orm';

export const enableRealtime = (tableName: string) => sql`
  ALTER PUBLICATION supabase_realtime ADD TABLE ${sql.raw(tableName)};
`;
