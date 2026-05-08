import { query } from '../db.js';

export async function createUserSession({ userId, tokenHash, expiresAt }) {
  const result = await query(
    `
      INSERT INTO user_sessions (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, created_at, expires_at
    `,
    [userId, tokenHash, expiresAt]
  );

  return result.rows[0];
}

export async function getUserSessionByTokenHash(tokenHash) {
  const result = await query(
    `
      SELECT
        s.id,
        s.user_id,
        s.token_hash,
        s.created_at,
        s.expires_at,
        u.full_name,
        u.email,
        u.phone,
        u.updated_at
      FROM user_sessions s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] || null;
}

export async function deleteUserSessionByTokenHash(tokenHash) {
  await query(
    `
      DELETE FROM user_sessions
      WHERE token_hash = $1
    `,
    [tokenHash]
  );
}
