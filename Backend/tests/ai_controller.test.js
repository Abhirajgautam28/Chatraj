import request from 'supertest';
import app from '../app.js';
import * as aiService from '../services/ai.service.js';

jest.mock('../services/ai.service.js');
jest.mock('../db/db.js');

describe('AI Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/ai/get-result', () => {
        test('should return response from AI service', async () => {
            aiService.generateResult.mockResolvedValue(JSON.stringify({ text: 'AI response' }));

            const res = await request(app)
                .get('/api/ai/get-result')
                .query({ prompt: 'hello' });

            expect(res.status).toBe(200);
            expect(res.body.response).toBe('AI response');
        });

        test('should return 400 if prompt is missing', async () => {
            const res = await request(app).get('/api/ai/get-result');
            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/ai/get-result', () => {
        test('should return response from AI service', async () => {
            aiService.generateResult.mockResolvedValue(JSON.stringify({ text: 'POST response' }));

            const res = await request(app)
                .post('/api/ai/get-result')
                .send({ prompt: 'hello', userApiKey: 'key' });

            expect(res.status).toBe(200);
            expect(res.body.response).toBe('POST response');
        });
    });
});
