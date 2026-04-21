import request from 'supertest';
import app from '../../app.js';
import * as newsletterService from '../../services/newsletter.service.js';

jest.mock('../../services/newsletter.service.js');
jest.mock('../../services/redis.service.js');

describe('Newsletter Controller', () => {
    describe('POST /api/newsletter/subscribe', () => {
        test('should subscribe email successfully', async () => {
            newsletterService.subscribe.mockResolvedValue({ subscription: { email: 'test@example.com' } });
            const res = await request(app)
                .post('/api/newsletter/subscribe')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Subscribed successfully!');
        });

        test('should return 409 if already subscribed', async () => {
            newsletterService.subscribe.mockRejectedValue(new Error('Email already subscribed'));
            const res = await request(app)
                .post('/api/newsletter/subscribe')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(409);
        });
    });
});
