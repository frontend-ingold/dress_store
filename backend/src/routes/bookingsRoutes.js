import express from 'express';
import { createBooking, getBookingByReference, getConflictingBooking } from '../repositories/bookingsRepository.js';
import { getPropertyBySlug } from '../repositories/propertiesRepository.js';
import {
  calculateTotalPrice,
  getNightCount,
  isValidDateRange,
  makeBookingReference,
} from '../utils/booking.js';

const router = express.Router();

router.post('/bookings', async (req, res, next) => {
  try {
    const {
      propertySlug,
      guestName,
      guestEmail,
      guestPhone,
      guestsCount,
      checkIn,
      checkOut,
      specialRequest,
    } = req.body;

    if (!propertySlug || !guestName || !guestEmail || !guestsCount || !checkIn || !checkOut) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    if (!isValidDateRange(checkIn, checkOut)) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const property = await getPropertyBySlug(propertySlug);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (Number(guestsCount) > property.max_guests) {
      return res.status(400).json({ message: `This property allows up to ${property.max_guests} guests` });
    }

    const conflict = await getConflictingBooking({
      propertyId: property.id,
      checkIn,
      checkOut,
    });

    if (conflict) {
      return res.status(409).json({ message: 'The selected dates are no longer available' });
    }

    const nights = getNightCount(checkIn, checkOut);
    const totalPriceUsd = calculateTotalPrice({
      nightlyRateUsd: property.nightly_rate_usd,
      cleaningFeeUsd: property.cleaning_fee_usd,
      nights,
    });

    const booking = await createBooking({
      bookingReference: makeBookingReference(),
      propertyId: property.id,
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      guestsCount: Number(guestsCount),
      checkIn,
      checkOut,
      nights,
      nightlyRateUsd: property.nightly_rate_usd,
      cleaningFeeUsd: property.cleaning_fee_usd,
      totalPriceUsd,
      specialRequest: specialRequest || '',
      status: 'confirmed',
    });

    res.status(201).json({
      booking: {
        ...booking,
        property: {
          name: property.name,
          slug: property.slug,
          location: property.location,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/bookings/:reference', async (req, res, next) => {
  try {
    const booking = await getBookingByReference(req.params.reference);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    next(error);
  }
});

export default router;
