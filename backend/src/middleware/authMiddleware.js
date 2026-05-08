import { getUserSessionByTokenHash } from '../repositories/sessionsRepository.js';
import { hashSessionToken } from '../utils/auth.js';

function extractBearerToken(headerValue = '') {
  if (!headerValue.startsWith('Bearer ')) {
    return '';
  }

  return headerValue.slice('Bearer '.length).trim();
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      req.auth = null;
      return next();
    }

    const session = await getUserSessionByTokenHash(hashSessionToken(token));

    if (!session) {
      req.auth = null;
      return next();
    }

    req.auth = {
      token,
      user: {
        id: session.user_id,
        full_name: session.full_name,
        email: session.email,
        phone: session.phone || '',
        updated_at: session.updated_at,
      },
    };

    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(req, res, next) {
  await optionalAuth(req, res, async (error) => {
    if (error) {
      next(error);
      return;
    }

    if (!req.auth?.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    next();
  });
}
