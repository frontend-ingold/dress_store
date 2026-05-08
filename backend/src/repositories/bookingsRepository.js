import { query } from '../db.js';

export async function getConflictingBooking({ propertyId, checkIn, checkOut }) {
  const result = await query(
    `
      SELECT id
      FROM bookings
      WHERE property_id = $1
        AND status IN ('pending', 'confirmed')
        AND check_in < $2
        AND check_out > $3
      LIMIT 1
    `,
    [propertyId, checkOut, checkIn]
  );

  return result.rows[0] || null;
}

export async function createBooking(payload) {
  const result = await query(
    `
      INSERT INTO bookings (
        booking_reference,
        user_id,
        property_id,
        guest_name,
        guest_email,
        guest_phone,
        guests_count,
        check_in,
        check_out,
        nights,
        nightly_rate_usd,
        cleaning_fee_usd,
        total_price_usd,
        special_request,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING
        id,
        booking_reference,
        user_id,
        guest_name,
        guest_email,
        guest_phone,
        guests_count,
        check_in::text AS check_in,
        check_out::text AS check_out,
        nights,
        nightly_rate_usd::float AS nightly_rate_usd,
        cleaning_fee_usd::float AS cleaning_fee_usd,
        total_price_usd::float AS total_price_usd,
        special_request,
        status,
        created_at
    `,
    [
      payload.bookingReference,
      payload.userId || null,
      payload.propertyId,
      payload.guestName,
      payload.guestEmail,
      payload.guestPhone,
      payload.guestsCount,
      payload.checkIn,
      payload.checkOut,
      payload.nights,
      payload.nightlyRateUsd,
      payload.cleaningFeeUsd,
      payload.totalPriceUsd,
      payload.specialRequest,
      payload.status,
    ]
  );

  return result.rows[0];
}

export async function getBookingByReference(reference) {
  const result = await query(
    `
      SELECT
        b.booking_reference,
        b.guest_name,
        b.guest_email,
        b.guest_phone,
        b.guests_count,
        b.check_in::text AS check_in,
        b.check_out::text AS check_out,
        b.nights,
        b.nightly_rate_usd::float AS nightly_rate_usd,
        b.cleaning_fee_usd::float AS cleaning_fee_usd,
        b.total_price_usd::float AS total_price_usd,
        b.special_request,
        b.status,
        b.created_at,
        p.name AS property_name,
        p.slug AS property_slug
      FROM bookings b
      INNER JOIN properties p ON p.id = b.property_id
      WHERE b.booking_reference = $1
      LIMIT 1
    `,
    [reference]
  );

  return result.rows[0] || null;
}

export async function listBookingsByUserId(userId) {
  const result = await query(
    `
      SELECT
        b.booking_reference,
        b.guest_name,
        b.guest_email,
        b.guest_phone,
        b.guests_count,
        b.check_in::text AS check_in,
        b.check_out::text AS check_out,
        b.nights,
        b.nightly_rate_usd::float AS nightly_rate_usd,
        b.cleaning_fee_usd::float AS cleaning_fee_usd,
        b.total_price_usd::float AS total_price_usd,
        b.special_request,
        b.status,
        b.created_at,
        p.name AS property_name,
        p.slug AS property_slug,
        p.card_image AS property_image,
        d.name || ', ' || d.country AS property_location
      FROM bookings b
      INNER JOIN properties p ON p.id = b.property_id
      INNER JOIN destinations d ON d.id = p.destination_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC, b.id DESC
    `,
    [userId]
  );

  return result.rows;
}
