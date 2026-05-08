import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

let pool;

function getPool() {
  if (!config.databaseUrl) {
    throw new Error(
      'DATABASE_URL is required. Set DATABASE_URL or a Vercel Postgres URL env var before using the booking API.'
    );
  }

  if (!pool) {
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  return pool;
}

export async function query(text, params) {
  return getPool().query(text, params);
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
