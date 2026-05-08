# Booking Backend

## Stack

- Node.js
- Express
- PostgreSQL on Neon
- `pg` driver

## Tables

- `destinations`: destination catalog used by search.
- `properties`: main stay inventory with pricing, guest capacity, and images.
- `property_images`: gallery images for each property.
- `amenities`: amenity master list.
- `property_amenities`: many-to-many amenity mapping.
- `bookings`: customer reservations with overlap checking and pricing snapshot.

The full schema is in `src/schema.sql`.

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL`
- `PORT`
- `CLIENT_URL`

## Commands

- `npm install`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run dev`

## Vercel deployment

- Set the Vercel project root directory to `backend`
- Add `DATABASE_URL` in Vercel environment variables
- The deployed base URL `/` returns a JSON status payload
- API endpoints are available under `/api/...`

## API routes

- `GET /api/health`
- `GET /api/destinations?q=mal`
- `GET /api/properties?featured=true`
- `GET /api/properties?location=Maldives&checkIn=2026-07-10&checkOut=2026-07-13&guests=2`
- `GET /api/properties/:slug`
- `POST /api/bookings`
- `GET /api/bookings/:reference`

## Example booking payload

```json
{
  "propertySlug": "palm-breeze",
  "guestName": "Test Guest",
  "guestEmail": "test@example.com",
  "guestPhone": "1234567890",
  "guestsCount": 2,
  "checkIn": "2026-07-10",
  "checkOut": "2026-07-13",
  "specialRequest": "Airport pickup"
}
```
