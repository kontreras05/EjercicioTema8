import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/user.model.js';
import Podcast from '../src/models/podcast.model.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_TEST_URI = mongoServer.getUri();
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_supersecretkey_min32chars_requerido';
  await connectDB();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

let userToken;
let adminToken;
let userId;

beforeEach(async () => {
  await User.deleteMany({});
  await Podcast.deleteMany({});

  const userRes = await request(app).post('/api/auth/register').send({
    name: 'Normal User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
  });
  userId = userRes.body.user._id;

  const loginUser = await request(app).post('/api/auth/login').send({ email: 'user@example.com', password: 'password123' });
  userToken = loginUser.body.token;

  await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });

  const loginAdmin = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password123' });
  adminToken = loginAdmin.body.token;
});

describe('Podcasts Endpoints', () => {
  
  test('GET /api/podcasts → 200 con array (solo publicados)', async () => {
    await Podcast.create({
      title: 'Published Podcast', description: 'desc 1234567', category: 'tech', duration: 120, author: userId, published: true
    });
    await Podcast.create({
      title: 'Draft Podcast', description: 'desc 1234567', category: 'tech', duration: 120, author: userId, published: false
    });

    const res = await request(app).get('/api/podcasts');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Published Podcast');
  });

  test('POST /api/podcasts → 201 con podcast creado (requiere token)', async () => {
    const res = await request(app)
      .post('/api/podcasts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'New Podcast',
        description: 'New Description 123',
        category: 'tech',
        duration: 120,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('New Podcast');
  });

  test('POST /api/podcasts → 401 sin token', async () => {
    const res = await request(app)
      .post('/api/podcasts')
      .send({
        title: 'New Podcast',
        description: 'New Description 123',
        category: 'tech',
        duration: 120,
      });
    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/podcasts/:id → 200 solo para admin', async () => {
    const podcast = await Podcast.create({
      title: 'Podcast to Delete', description: 'desc 1234567', category: 'tech', duration: 120, author: userId
    });

    const res = await request(app)
      .delete(`/api/podcasts/${podcast._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(res.statusCode).toBe(200);
  });

  test('DELETE /api/podcasts/:id → 403 para user normal', async () => {
    const podcast = await Podcast.create({
      title: 'Podcast to Delete', description: 'desc 1234567', category: 'tech', duration: 120, author: userId
    });

    const res = await request(app)
      .delete(`/api/podcasts/${podcast._id}`)
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(res.statusCode).toBe(403);
  });

  test('GET /api/podcasts/admin/all → 200 solo para admin', async () => {
    await Podcast.create({
      title: 'Podcast 1', description: 'desc 1234567', category: 'tech', duration: 120, author: userId, published: true
    });
    await Podcast.create({
      title: 'Podcast 2', description: 'desc 1234567', category: 'tech', duration: 120, author: userId, published: false
    });

    const resAdmin = await request(app)
      .get('/api/podcasts/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resAdmin.statusCode).toBe(200);
    expect(resAdmin.body.length).toBe(2);

    const resUser = await request(app)
      .get('/api/podcasts/admin/all')
      .set('Authorization', `Bearer ${userToken}`);
    expect(resUser.statusCode).toBe(403);
  });
});
