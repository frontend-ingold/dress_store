import dotenv from 'dotenv';

dotenv.config();

function parseAllowedOrigins() {
  const rawOrigins = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URLS,
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URLS,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  if (rawOrigins.length === 0) {
    return ['http://localhost:3000'];
  }

  return [...new Set(rawOrigins)];
}

export const config = {
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  allowedOrigins: parseAllowedOrigins(),
  databaseUrl:
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    '',
};
