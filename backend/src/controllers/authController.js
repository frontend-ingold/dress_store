import crypto from "crypto";
import { promisify } from "util";
import { query, withTransaction } from "../config/db.js";

const scrypt = promisify(crypto.scrypt);

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, storedHash = "") {
  const [salt, key] = storedHash.split(":");

  if (!salt || !key) {
    return false;
  }

  const derivedKey = await scrypt(password, salt, 64);
  const storedKey = Buffer.from(key, "hex");

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedKey, derivedKey);
}

function createAuthToken() {
  return crypto.randomBytes(32).toString("hex");
}

function createResetToken() {
  return crypto.randomBytes(24).toString("hex");
}

function buildSessionPayload(user) {
  return {
    mode: "member",
    token: createAuthToken(),
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
}

export async function getUserProfile(request, response, next) {
  const userId = Number(request.params.userId);

  if (!Number.isInteger(userId) || userId < 1) {
    response.status(400).json({ message: "A valid user id is required." });
    return;
  }

  try {
    const users = await query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.created_at AS "createdAt",
         COUNT(o.id)::int AS "orderCount",
         COALESCE(SUM(o.total_amount), 0)::numeric AS "totalSpent",
         MAX(o.created_at) AS "lastOrderAt"
       FROM users u
       LEFT JOIN orders o
         ON o.user_id = u.id
         OR (o.user_id IS NULL AND LOWER(o.email) = LOWER(u.email))
       WHERE u.id = $1
         AND u.is_active = TRUE
       GROUP BY u.id, u.name, u.email, u.created_at
       LIMIT 1`,
      [userId]
    );
    const user = users[0];

    if (!user) {
      response.status(404).json({ message: "Profile not found." });
      return;
    }

    response.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        orderCount: Number(user.orderCount || 0),
        totalSpent: Number(user.totalSpent || 0),
        lastOrderAt: user.lastOrderAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function registerUser(request, response, next) {
  const name = request.body.name?.trim?.() || "";
  const email = normalizeEmail(request.body.email);
  const password = request.body.password?.trim?.() || "";

  if (!name || !email || !password) {
    response.status(400).json({ message: "Name, email, and password are required." });
    return;
  }

  if (!validateEmail(email)) {
    response.status(400).json({ message: "Enter a valid email address." });
    return;
  }

  if (password.length < 6) {
    response.status(400).json({ message: "Password must be at least 6 characters long." });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);

    const result = await withTransaction(async (client) => {
      const existingUser = await client.query(
        `SELECT id
         FROM users
         WHERE email = $1`,
        [email]
      );

      if (existingUser.rows[0]) {
        throw new Error("An account with this email already exists.");
      }

      const createdUser = await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email`,
        [name, email, passwordHash]
      );

      return createdUser.rows[0];
    });

    response.status(201).json({
      message: "Account created successfully.",
      session: buildSessionPayload(result)
    });
  } catch (error) {
    if (error.message) {
      response.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}

export async function loginUser(request, response, next) {
  const email = normalizeEmail(request.body.email);
  const password = request.body.password?.trim?.() || "";

  if (!email || !password) {
    response.status(400).json({ message: "Email and password are required." });
    return;
  }

  try {
    const users = await query(
      `SELECT id, name, email, password_hash AS "passwordHash"
       FROM users
       WHERE email = $1
         AND is_active = TRUE
       LIMIT 1`,
      [email]
    );
    const user = users[0];

    if (!user) {
      response.status(400).json({ message: "Invalid email or password." });
      return;
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      response.status(400).json({ message: "Invalid email or password." });
      return;
    }

    response.json({
      message: "Login successful.",
      session: buildSessionPayload(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function requestPasswordReset(request, response, next) {
  const email = normalizeEmail(request.body.email);

  if (!email || !validateEmail(email)) {
    response.status(400).json({ message: "Enter a valid email address." });
    return;
  }

  try {
    const result = await withTransaction(async (client) => {
      const userResult = await client.query(
        `SELECT id, email
         FROM users
         WHERE email = $1
           AND is_active = TRUE
         LIMIT 1`,
        [email]
      );
      const user = userResult.rows[0];

      if (!user) {
        return null;
      }

      await client.query(
        `UPDATE password_reset_tokens
         SET used_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
           AND used_at IS NULL
           AND expires_at > CURRENT_TIMESTAMP`,
        [user.id]
      );

      const resetToken = createResetToken();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

      await client.query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, resetToken, expiresAt]
      );

      return {
        resetToken,
        expiresAt
      };
    });

    response.json({
      message: "If the account exists, a password reset token has been generated.",
      resetToken: result?.resetToken || "",
      expiresAt: result?.expiresAt || null
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(request, response, next) {
  const token = request.body.token?.trim?.() || "";
  const password = request.body.password?.trim?.() || "";

  if (!token || !password) {
    response.status(400).json({ message: "Reset token and new password are required." });
    return;
  }

  if (password.length < 6) {
    response.status(400).json({ message: "Password must be at least 6 characters long." });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);

    const result = await withTransaction(async (client) => {
      const resetResult = await client.query(
        `SELECT id, user_id AS "userId"
         FROM password_reset_tokens
         WHERE token = $1
           AND used_at IS NULL
           AND expires_at > CURRENT_TIMESTAMP
         LIMIT 1`,
        [token]
      );
      const resetRow = resetResult.rows[0];

      if (!resetRow) {
        throw new Error("Reset token is invalid or expired.");
      }

      await client.query(
        `UPDATE users
         SET password_hash = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [resetRow.userId, passwordHash]
      );

      await client.query(
        `UPDATE password_reset_tokens
         SET used_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [resetRow.id]
      );

      const userResult = await client.query(
        `SELECT id, name, email
         FROM users
         WHERE id = $1`,
        [resetRow.userId]
      );

      return userResult.rows[0];
    });

    response.json({
      message: "Password updated successfully.",
      session: buildSessionPayload(result)
    });
  } catch (error) {
    if (error.message) {
      response.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}
