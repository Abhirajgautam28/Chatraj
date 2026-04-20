import request from 'supertest';
import app from '../../app.js';
import * as aiService from '../../services/ai.service.js';

jest.mock('../../services/ai.service.js');
jest.mock('../../services/redis.service.js');

describe('AI Controller', () => {
    describe('POST /api/ai/get-result', () => {
        test('should return AI response text', async () => {
            aiService.generateResult.mockResolvedValue(JSON.stringify({ text: 'AI Answer' }));
            const res = await request(app)
                .post('/api/ai/get-result')
                .send({ prompt: 'Hello' });

            expect(res.status).toBe(200);
            expect(res.body.data.response).toBe('AI Answer');
        });

        test('should return 400 if prompt missing', async () => {
            const res = await request(app).post('/api/ai/get-result').send({});
            expect(res.status).toBe(400);
        });
    });
});
