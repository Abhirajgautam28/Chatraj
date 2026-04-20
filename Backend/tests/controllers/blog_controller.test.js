import request from 'supertest';
import app from '../../app.js';
import * as blogService from '../../services/blog.service.js';
import jwt from 'jsonwebtoken';

jest.mock('../../services/blog.service.js');
jest.mock('../../services/redis.service.js');

describe('Blog Controller', () => {
    const mockToken = jwt.sign({ _id: 'user123', email: 'test@example.com' }, process.env.JWT_SECRET || 'secret');

    describe('GET /api/blogs', () => {
        test('should return all blogs', async () => {
            blogService.getAllBlogs.mockResolvedValue([{ title: 'Blog 1' }]);
            const res = await request(app).get('/api/blogs');
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe('POST /api/blogs/create', () => {
        test('should create a blog when authenticated', async () => {
            blogService.createBlog.mockResolvedValue({ title: 'New Blog' });
            const res = await request(app)
                .post('/api/blogs/create')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ title: 'New Blog', content: 'Content' });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Blog created successfully');
        });
    });
});
