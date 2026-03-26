import express from 'express';
import authRoutes from './routes/auth.routes.js';
import podcastRoutes from './routes/podcasts.routes.js';
import { setupSwagger } from './docs/swagger.js';

const app = express();

app.use(express.json());

setupSwagger(app);

app.use('/api/auth', authRoutes);
app.use('/api/podcasts', podcastRoutes);

export default app;
