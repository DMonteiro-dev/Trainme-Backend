import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './testUtils.js';

setupTestDB();

describe('Auth flow', () => {
  it('registers a new client and returns tokens', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Client One',
      email: 'client@example.com',
      password: 'Password123'
    });
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('logs in an existing client', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Client Two',
      email: 'client2@example.com',
      password: 'Password123'
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'client2@example.com',
      password: 'Password123'
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects invalid payloads', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'not-an-email',
      password: '123'
    });
    expect(res.status).toBe(400);
  });
});
