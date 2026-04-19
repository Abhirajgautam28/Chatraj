import request from 'supertest';
import app from '../app.js';
import axios from 'axios';

const base = process.env.BASE_URL || 'http://localhost:8080';

describe('Lightweight E2E and health checks', () => {
  test('GET /health returns 200 (supertest)', async () => {
    await request(app).get('/health').expect(200);
  }, 10000);

  test('Register and public endpoints (axios against running server)', async () => {
    const rnd = Math.random().toString(36).slice(2,8);
    const testUser = {
      firstName: 'E2E',
      lastName: 'Tester',
      email: `e2e+${rnd}@example.com`,
      password: 'password123',
      googleApiKey: 'fake-key-1234567890'
    };

    // Register
    const reg = await axios.post(`${base}/api/users/register`, testUser).catch(e => e.response || e);
    expect(reg.status).toBe(201);

    // Public blogs
    const blogs = await axios.get(`${base}/api/blogs`).catch(e => e.response || e);
    expect(blogs.status).toBe(200);

    // Project showcase
    const showcase = await axios.get(`${base}/api/projects/showcase`).catch(e => e.response || e);
    expect(showcase.status).toBe(200);
  }, 30000);
});
