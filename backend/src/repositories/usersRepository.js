import { query } from '../db.js';

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function createUser({ fullName, email, phone, passwordHash }) {
  const result = await query(
    `
      INSERT INTO users (full_name, email, phone, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, phone, created_at, updated_at
    `,
    [fullName, email, phone || '', passwordHash]
  );

  return mapUser(result.rows[0]);
}

export async function getUserByEmail(email) {
  const result = await query(
    `
      SELECT id, full_name, email, phone, password_hash, created_at, updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

export async function getUserById(id) {
  const result = await query(
    `
      SELECT id, full_name, email, phone, created_at, updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapUser(result.rows[0]);
}

export async function updateUserProfile(id, { fullName, phone }) {
  const result = await query(
    `
      UPDATE users
      SET full_name = $2,
          phone = $3,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, full_name, email, phone, created_at, updated_at
    `,
    [id, fullName, phone || '']
  );

  return mapUser(result.rows[0]);
}
