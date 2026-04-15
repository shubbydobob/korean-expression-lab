import { Pool } from "pg";

let pool: Pool | null = null;

export function getPostgresPool(connectionString?: string) {
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
    });
  }

  return pool;
}
