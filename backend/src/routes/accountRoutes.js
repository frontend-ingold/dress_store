import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { listBookingsByUserId } from '../repositories/bookingsRepository.js';
import { updateUserProfile } from '../repositories/usersRepository.js';

const router = express.Router();

router.get('/account', requireAuth, async (req, res) => {
  res.json({
    user: req.auth.user,
  });
});

router.patch('/account', requireAuth, async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    const user = await updateUserProfile(req.auth.user.id, {
      fullName: fullName.trim(),
      phone: phone?.trim() || '',
    });

    return res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/account/bookings', requireAuth, async (req, res, next) => {
  try {
    const bookings = await listBookingsByUserId(req.auth.user.id);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

export default router;
