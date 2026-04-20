import request from 'supertest';
import app from '../../app.js';
import userModel from '../../models/user.model.js';
import Newsletter from '../../models/newsletter.model.js';
import Blog from '../../models/blog.model.js';
import jwt from 'jsonwebtoken';
import redisClient from '../../services/redis.service.js';

jest.mock('../../models/user.model.js');
jest.mock('../../models/newsletter.model.js');
jest.mock('../../models/blog.model.js');
jest.mock('../../services/redis.service.js');
jest.mock('../../db/db.js');

describe('Integration Flows', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secret';
    });

    test('GET /health should return 200', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    test('Newsletter subscription flow', async () => {
        Newsletter.findOne.mockResolvedValue(null);
        Newsletter.create.mockResolvedValue({ email: 't@e.com' });
        const res = await request(app).post('/api/newsletter/subscribe').send({ email: 't@e.com' });
        expect(res.status).toBe(201);
    });

    test('Authenticated blog creation flow', async () => {
        const mockUser = { _id: 'u1', email: 't@e.com' };
        redisClient.get.mockResolvedValue(null);
        jest.spyOn(jwt, 'verify').mockReturnValue(mockUser);
        userModel.findOne.mockResolvedValue(mockUser);
        Blog.prototype.save = jest.fn().mockResolvedValue({ title: 'T' });

        const res = await request(app)
            .post('/api/blogs/create')
            .set('Authorization', 'Bearer token')
            .send({ title: 'T', content: 'C' });
        expect(res.status).toBe(201);
    });
});
