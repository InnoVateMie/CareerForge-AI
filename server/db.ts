import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Database persistence will fail.");
} else {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`[db] Initializing pool - host: ${url.hostname}, user: ${url.username.split('.')[0]}.[REDACTED]`);
  } catch (e) {
    console.warn("[db] Could not parse DATABASE_URL for logging.");
  }
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema });
