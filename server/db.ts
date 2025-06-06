import * as schema from "@shared/schema";
import pkg from "pg";
const { Pool: PgPool } = pkg;
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import { drizzle as pgDrizzle } from "drizzle-orm/node-postgres";
import ws from "ws";
import 'dotenv/config';
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

let db;
let pool;

// Prefer pg client by default for local and Docker
if (process.env.IS_DOCKER === "true" || process.env.NODE_ENV !== "production") {
  console.log("Using pg client for local/Docker environment");
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = pgDrizzle(pool, { schema });
} else {
  console.log("Using Neon serverless PostgreSQL client (production)");
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = neonDrizzle(pool, { schema });
}

export { pool, db };
