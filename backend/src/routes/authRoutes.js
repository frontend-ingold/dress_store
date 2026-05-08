import express from 'express';
import { createUser, getUserByEmail } from '../repositories/usersRepository.js';
import {
  createUserSession,
  deleteUserSessionByTokenHash,
} from '../repositories/sessionsRepository.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';
import {
  generateSessionToken,
  getSessionExpiryDate,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from '../utils/auth.js';

const router = express.Router();

function sanitizeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone || '',
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

router.post('/auth/register', async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ message: 'An account already exists for that email' });
    }

    const user = await createUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || '',
      passwordHash: await hashPassword(password),
    });

    const token = generateSessionToken();
    await createUserSession({
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt: getSessionExpiryDate(),
    });

    return res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await getUserByEmail(email);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateSessionToken();
    await createUserSession({
      userId: user.id,
      tokenHash: hashSessionToken(token),
      expiresAt: getSessionExpiryDate(),
    });

    return res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/auth/me', optionalAuth, async (req, res) => {
  if (!req.auth?.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  return res.json({
    user: req.auth.user,
  });
});

router.post('/auth/logout', requireAuth, async (req, res, next) => {
  try {
    await deleteUserSessionByTokenHash(hashSessionToken(req.auth.token));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
