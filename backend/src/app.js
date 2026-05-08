import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { query } from './db.js';
import propertiesRoutes from './routes/propertiesRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';

const app = express();

app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors({ origin: true }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'booking-backend',
    message: 'Booking backend is running',
  });
});

app.get('/api/health', async (_req, res) => {
  const health = {
    ok: true,
    service: 'booking-backend',
    hasDatabaseUrl: Boolean(config.databaseUrl),
    database: {
      ok: false,
    },
  };

  if (!config.databaseUrl) {
    return res.status(500).json({
      ...health,
      ok: false,
      database: {
        ok: false,
        error: 'DATABASE_URL missing',
      },
    });
  }

  try {
    await query('SELECT 1');
    health.database = {
      ok: true,
    };
    return res.json(health);
  } catch (error) {
    return res.status(500).json({
      ...health,
      ok: false,
      database: {
        ok: false,
        error: error.message,
      },
    });
  }
});

app.use('/api', propertiesRoutes);
app.use('/api', bookingsRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: 'Internal server error',
    error: error.message,
  });
});

export default app;
