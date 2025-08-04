import { sql } from 'drizzle-orm';

export const manageUpdatedAt = (tableName: string) => sql`
  CREATE TRIGGER on_update_timestamp
  BEFORE UPDATE ON ${sql.raw(tableName)}
  FOR EACH ROW
  EXECUTE PROCEDURE on_update_timestamp();
`;
