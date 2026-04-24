import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import podcastRoutes from './routes/podcasts.routes.js';
import { setupSwagger } from './docs/swagger.js';

const app = express();

app.use(express.json());

setupSwagger(app);

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'ok', 
    database: dbStatus 
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/podcasts', podcastRoutes);

export default app;
