import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import propertiesRoutes from './routes/propertiesRoutes.js';
import bookingsRoutes from './routes/bookingsRoutes.js';

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
  })
);
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
