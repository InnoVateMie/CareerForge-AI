import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  console.warn("DATABASE_URL not set. Database persistence will fail.");
} else {
  try {
    const url = new URL(connectionString);
    console.log(`[db] Initializing pool - host: ${url.hostname}, user: ${url.username.split('.')[0]}.[REDACTED]`);
  } catch (e) {
    console.warn("[db] Could not parse DATABASE_URL for logging.");
  }
}

export const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool, { schema });
