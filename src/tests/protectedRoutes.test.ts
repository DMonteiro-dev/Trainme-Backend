import request from 'supertest';
import app from '../app.js';
import { UserModel } from '../models/user.model.js';
import { setupTestDB } from './testUtils.js';

setupTestDB();

describe('Role-based access control', () => {
  const adminCredentials = { email: 'admin@example.com', password: 'Admin123!' };

  beforeEach(async () => {
    await UserModel.create({ name: 'Admin', email: adminCredentials.email, password: adminCredentials.password, role: 'admin' });
  });

  it('allows admin to list users', async () => {
    const login = await request(app).post('/api/auth/login').send(adminCredentials);
    const token = login.body.data.accessToken;

    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('blocks clients from admin endpoints', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Client',
      email: 'client3@example.com',
      password: 'Password123'
    });
    const login = await request(app).post('/api/auth/login').send({
      email: 'client3@example.com',
      password: 'Password123'
    });
    const token = login.body.data.accessToken;

    const res = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });
});
