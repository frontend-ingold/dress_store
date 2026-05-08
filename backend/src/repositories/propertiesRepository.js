import { query } from '../db.js';

function buildAvailabilityClause({ checkIn, checkOut }) {
  if (!checkIn || !checkOut) {
    return {
      sql: '',
      params: [],
    };
  }

  return {
    sql: `
      AND NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.property_id = p.id
          AND b.status IN ('pending', 'confirmed')
          AND b.check_in < $${1}
          AND b.check_out > $${2}
      )
    `,
    params: [checkOut, checkIn],
  };
}

export async function listProperties(filters = {}) {
  const params = [];
  const where = [];

  if (filters.featured === true) {
    params.push(true);
    where.push(`p.featured = $${params.length}`);
  }

  if (filters.location) {
    params.push(`%${filters.location}%`);
    where.push(`(d.name ILIKE $${params.length} OR d.country ILIKE $${params.length} OR d.region ILIKE $${params.length})`);
  }

  if (filters.guests) {
    params.push(Number(filters.guests));
    where.push(`p.max_guests >= $${params.length}`);
  }

  const availability = buildAvailabilityClause({
    checkIn: filters.checkIn,
    checkOut: filters.checkOut,
  });

  const availabilityStartIndex = params.length;
  params.push(...availability.params);
  const availabilitySql = availability.sql.replace(/\$(\d+)/g, (_, index) => `$${Number(index) + availabilityStartIndex}`);

  const sql = `
    SELECT
      p.id,
      p.slug,
      p.name,
      p.summary,
      p.card_image AS image,
      p.hero_image AS hero_image,
      p.nightly_rate_usd::float AS nightly_rate_usd,
      p.cleaning_fee_usd::float AS cleaning_fee_usd,
      p.rating::float AS rating,
      p.bedrooms,
      p.bathrooms,
      p.max_guests,
      p.featured,
      d.name || ', ' || d.country AS location,
      d.name AS destination_name,
      d.country AS destination_country
    FROM properties p
    INNER JOIN destinations d ON d.id = p.destination_id
    WHERE 1 = 1
    ${where.length ? `AND ${where.join(' AND ')}` : ''}
    ${availabilitySql}
    ORDER BY p.featured DESC, p.rating DESC, p.created_at DESC
  `;

  const result = await query(sql, params);
  return result.rows;
}

export async function getPropertyBySlug(slug) {
  const propertyResult = await query(
    `
      SELECT
        p.id,
        p.slug,
        p.name,
        p.summary,
        p.description,
        p.address,
        p.card_image AS image,
        p.hero_image AS hero_image,
        p.nightly_rate_usd::float AS nightly_rate_usd,
        p.cleaning_fee_usd::float AS cleaning_fee_usd,
        p.rating::float AS rating,
        p.bedrooms,
        p.bathrooms,
        p.max_guests,
        d.name || ', ' || d.country AS location
      FROM properties p
      INNER JOIN destinations d ON d.id = p.destination_id
      WHERE p.slug = $1
      LIMIT 1
    `,
    [slug]
  );

  if (propertyResult.rows.length === 0) {
    return null;
  }

  const property = propertyResult.rows[0];

  const [imagesResult, amenitiesResult] = await Promise.all([
    query(
      `
        SELECT image_url
        FROM property_images
        WHERE property_id = $1
        ORDER BY sort_order ASC, id ASC
      `,
      [property.id]
    ),
    query(
      `
        SELECT a.name
        FROM property_amenities pa
        INNER JOIN amenities a ON a.id = pa.amenity_id
        WHERE pa.property_id = $1
        ORDER BY a.name ASC
      `,
      [property.id]
    ),
  ]);

  return {
    ...property,
    images: imagesResult.rows.map((row) => row.image_url),
    amenities: amenitiesResult.rows.map((row) => row.name),
  };
}

export async function listDestinations(search = '') {
  const params = [];
  let sql = `
    SELECT slug, name, country, region
    FROM destinations
  `;

  if (search) {
    params.push(`%${search}%`);
    sql += ` WHERE name ILIKE $1 OR country ILIKE $1 OR region ILIKE $1 `;
  }

  sql += ' ORDER BY name ASC';

  const result = await query(sql, params);
  return result.rows;
}
