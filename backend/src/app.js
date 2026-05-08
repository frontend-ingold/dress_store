import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import propertiesRoutes from './routes/propertiesRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';

const app = express();

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (config.allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    return url.hostname.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'booking-backend',
    message: 'Booking backend is running',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'booking-backend',
    hasDatabaseUrl: Boolean(config.databaseUrl),
  });
});

app.use('/api', propertiesRoutes);
app.use('/api', bookingsRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: 'Internal server error',
  });
});

export default app;
