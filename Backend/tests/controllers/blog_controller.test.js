import request from 'supertest';
import app from '../../app.js';
import * as blogService from '../../services/blog.service.js';

jest.mock('../../services/blog.service.js');
jest.mock('../../db/db.js');

describe('Blog Controller', () => {
    test('GET /api/blogs success', async () => {
        blogService.getAllBlogs.mockResolvedValue([]);
        const res = await request(app).get('/api/blogs');
        expect(res.status).toBe(200);
    });

    test('POST /api/blogs/create success', async () => {
        blogService.createBlog.mockResolvedValue({ title: 'T' });
        const res = await request(app)
            .post('/api/blogs/create')
            .set('Authorization', 'Bearer t')
            .send({ title: 'T', content: 'C' });
        expect(res.status).toBe(201);
    });
});
