import request from 'supertest';
import app from '../../app.js';
import * as aiService from '../../services/ai.service.js';
import jwt from 'jsonwebtoken';

jest.mock('../../services/ai.service.js');
jest.mock('../../services/redis.service.js');

describe('AI Controller', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ email: 'test@example.com' }, process.env.JWT_SECRET || 'secret');
    });

    describe('GET /api/ai/get-result', () => {
        test('should return AI response text', async () => {
            aiService.generateResult.mockResolvedValue(JSON.stringify({ text: 'AI Answer' }));
            const res = await request(app)
                .get('/api/ai/get-result')
                .set('Authorization', `Bearer ${token}`)
                .query({ prompt: 'Hello' });

            expect(res.status).toBe(200);
            expect(res.body.data.response).toBe('AI Answer');
        });

        test('should return 400 if prompt missing', async () => {
            const res = await request(app)
                .get('/api/ai/get-result')
                .set('Authorization', `Bearer ${token}`)
                .query({});
            expect(res.status).toBe(400);
        });

        test('should return 401 if unauthorized', async () => {
            const res = await request(app)
                .get('/api/ai/get-result')
                .query({ prompt: 'Hello' });
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/ai/', () => {
        test('should return AI response text via POST', async () => {
            aiService.generateResult.mockResolvedValue(JSON.stringify({ text: 'AI POST Answer' }));
            const res = await request(app)
                .post('/api/ai/')
                .set('Authorization', `Bearer ${token}`)
                .send({ prompt: 'Hello AI' });

            expect(res.status).toBe(200);
            expect(res.body.data.response).toBe('AI POST Answer');
        });
    });
});
