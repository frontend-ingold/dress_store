import { closePool, query } from '../db.js';
import { amenities, destinations, properties, reviews } from '../data/seedData.js';

function buildBookingReference() {
  return `BK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function seed() {
  await query('BEGIN');

  try {
    const destinationIds = new Map();
    const amenityIds = new Map();
    const propertyIds = new Map();

    for (const destination of destinations) {
      const result = await query(
        `
          INSERT INTO destinations (slug, name, country, region, hero_image)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (slug) DO UPDATE
          SET name = EXCLUDED.name,
              country = EXCLUDED.country,
              region = EXCLUDED.region,
              hero_image = EXCLUDED.hero_image
          RETURNING id
        `,
        [
          destination.slug,
          destination.name,
          destination.country,
          destination.region,
          destination.heroImage,
        ]
      );

      destinationIds.set(destination.slug, result.rows[0].id);
    }

    for (const amenityName of amenities) {
      const result = await query(
        `
          INSERT INTO amenities (name)
          VALUES ($1)
          ON CONFLICT (name) DO UPDATE
          SET name = EXCLUDED.name
          RETURNING id
        `,
        [amenityName]
      );

      amenityIds.set(amenityName, result.rows[0].id);
    }

    for (const property of properties) {
      const result = await query(
        `
          INSERT INTO properties (
            destination_id,
            slug,
            name,
            summary,
            description,
            address,
            card_image,
            hero_image,
            nightly_rate_usd,
            cleaning_fee_usd,
            rating,
            bedrooms,
            bathrooms,
            max_guests,
            featured
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (slug) DO UPDATE
          SET destination_id = EXCLUDED.destination_id,
              name = EXCLUDED.name,
              summary = EXCLUDED.summary,
              description = EXCLUDED.description,
              address = EXCLUDED.address,
              card_image = EXCLUDED.card_image,
              hero_image = EXCLUDED.hero_image,
              nightly_rate_usd = EXCLUDED.nightly_rate_usd,
              cleaning_fee_usd = EXCLUDED.cleaning_fee_usd,
              rating = EXCLUDED.rating,
              bedrooms = EXCLUDED.bedrooms,
              bathrooms = EXCLUDED.bathrooms,
              max_guests = EXCLUDED.max_guests,
              featured = EXCLUDED.featured
          RETURNING id
        `,
        [
          destinationIds.get(property.destinationSlug),
          property.slug,
          property.name,
          property.summary,
          property.description,
          property.address,
          property.cardImage,
          property.heroImage,
          property.nightlyRateUsd,
          property.cleaningFeeUsd,
          property.rating,
          property.bedrooms,
          property.bathrooms,
          property.maxGuests,
          property.featured,
        ]
      );

      const propertyId = result.rows[0].id;
      propertyIds.set(property.slug, propertyId);

      await query('DELETE FROM property_images WHERE property_id = $1', [propertyId]);
      await query('DELETE FROM property_amenities WHERE property_id = $1', [propertyId]);

      for (const [index, imageUrl] of property.images.entries()) {
        await query(
          `
            INSERT INTO property_images (property_id, image_url, sort_order)
            VALUES ($1, $2, $3)
          `,
          [propertyId, imageUrl, index]
        );
      }

      for (const amenityName of property.amenities) {
        await query(
          `
            INSERT INTO property_amenities (property_id, amenity_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `,
          [propertyId, amenityIds.get(amenityName)]
        );
      }
    }

    await query('DELETE FROM property_reviews');

    for (const review of reviews) {
      await query(
        `
          INSERT INTO property_reviews (
            property_id,
            guest_name,
            guest_location,
            guest_avatar,
            rating,
            review_text
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          propertyIds.get(review.propertySlug),
          review.guestName,
          review.guestLocation,
          review.guestAvatar,
          review.rating,
          review.reviewText,
        ]
      );
    }

    const existingBookingCount = await query('SELECT COUNT(*)::int AS count FROM bookings');

    if (existingBookingCount.rows[0].count === 0) {
      const sampleBookings = [
        {
          propertySlug: 'the-daria',
          guestName: 'Mia Carter',
          guestEmail: 'mia@example.com',
          guestsCount: 4,
          checkIn: '2026-06-10',
          checkOut: '2026-06-14',
        },
        {
          propertySlug: 'azure-haven',
          guestName: 'David Wong',
          guestEmail: 'david@example.com',
          guestsCount: 2,
          checkIn: '2026-06-18',
          checkOut: '2026-06-22',
        },
      ];

      for (const booking of sampleBookings) {
        const property = properties.find((entry) => entry.slug === booking.propertySlug);
        const nights =
          (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
          (1000 * 60 * 60 * 24);
        const total = Number(property.nightlyRateUsd) * nights + Number(property.cleaningFeeUsd);

        await query(
          `
            INSERT INTO bookings (
              booking_reference,
              property_id,
              guest_name,
              guest_email,
              guests_count,
              check_in,
              check_out,
              nights,
              nightly_rate_usd,
              cleaning_fee_usd,
              total_price_usd,
              status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'confirmed')
          `,
          [
            buildBookingReference(),
            propertyIds.get(booking.propertySlug),
            booking.guestName,
            booking.guestEmail,
            booking.guestsCount,
            booking.checkIn,
            booking.checkOut,
            nights,
            property.nightlyRateUsd,
            property.cleaningFeeUsd,
            total,
          ]
        );
      }
    }

    await query('COMMIT');
    console.log('Database seeded.');
  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
