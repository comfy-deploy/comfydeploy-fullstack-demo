// db.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Importante para conexiones SSL con proveedores como Supabase o Railway
  },
});

export const db = drizzle(pool);
