import express from 'express';
import {
  getPropertyBySlug,
  listDestinations,
  listProperties,
} from '../repositories/propertiesRepository.js';

const router = express.Router();

router.get('/destinations', async (req, res, next) => {
  try {
    const destinations = await listDestinations(req.query.q || '');
    res.json({ destinations });
  } catch (error) {
    next(error);
  }
});

router.get('/properties', async (req, res, next) => {
  try {
    const properties = await listProperties({
      featured: req.query.featured === 'true',
      location: req.query.location || '',
      guests: req.query.guests ? Number(req.query.guests) : undefined,
      checkIn: req.query.checkIn || '',
      checkOut: req.query.checkOut || '',
    });

    res.json({ properties });
  } catch (error) {
    next(error);
  }
});

router.get('/properties/:slug', async (req, res, next) => {
  try {
    const property = await getPropertyBySlug(req.params.slug);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ property });
  } catch (error) {
    next(error);
  }
});

export default router;
