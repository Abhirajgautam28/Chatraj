import request from 'supertest';
import app from '../../app.js';
import * as newsletterService from '../../services/newsletter.service.js';

jest.mock('../../services/newsletter.service.js');
jest.mock('../../db/db.js');

describe('Newsletter Controller', () => {
    test('POST /api/newsletter/subscribe success', async () => {
        newsletterService.subscribe.mockResolvedValue({ subscription: {} });
        const res = await request(app).post('/api/newsletter/subscribe').send({ email: 't@e.com' });
        expect(res.status).toBe(201);
    });
});
