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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', propertiesRoutes);
app.use('/api', bookingsRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: 'Internal server error',
  });
});

app.listen(config.port, () => {
  console.log(`Booking API listening on port ${config.port}`);
});
