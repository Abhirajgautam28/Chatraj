import request from 'supertest';
import express from 'express';

describe('IP Spoofing Protection', () => {
  let app;

  beforeEach(() => {
    app = express();
    // Enable trust proxy as we did in Backend/app.js
    app.set('trust proxy', 1);

    app.get('/test-ip', (req, res) => {
      res.json({ ip: req.ip, secure: req.secure });
    });
  });

  test('should correctly identify client IP with trust proxy 1', async () => {
    // With trust proxy 1, the rightmost IP in X-Forwarded-For is trusted as the
    // downstream proxy, and the IP before it is considered the client's IP.
    const response = await request(app)
      .get('/test-ip')
      .set('X-Forwarded-For', '203.0.113.1');

    // In a local test with trust proxy 1, X-Forwarded-For: 'client'
    // Express trusts the immediate peer (the test runner) and takes the
    // rightmost entry in X-Forwarded-For as the client IP.
    expect(response.body.ip).toBe('203.0.113.1');
  });

  test('should detect HTTPS via X-Forwarded-Proto when trust proxy is enabled', async () => {
    const response = await request(app)
      .get('/test-ip')
      .set('X-Forwarded-Proto', 'https');

    expect(response.body.secure).toBe(true);
  });

  test('should NOT detect HTTPS via X-Forwarded-Proto if it is not https', async () => {
    const response = await request(app)
      .get('/test-ip')
      .set('X-Forwarded-Proto', 'http');

    expect(response.body.secure).toBe(false);
  });
});
