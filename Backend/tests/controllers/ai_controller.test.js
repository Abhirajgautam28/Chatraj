import request from 'supertest';
import app from '../../app.js';
import * as aiService from '../../services/ai.service.js';

jest.mock('../../services/ai.service.js');
jest.mock('../../db/db.js');

describe('AI Controller', () => {
    test('GET /api/ai/get-result success', async () => {
        const res = await request(app).get('/api/ai/get-result').query({ prompt: 'hi' });
        expect(res.status).toBe(200);
    });
});
