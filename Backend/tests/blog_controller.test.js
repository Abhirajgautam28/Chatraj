import request from 'supertest';
import app from '../app.js';
import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';

jest.mock('../models/blog.model.js');
jest.mock('../models/user.model.js');
jest.mock('../services/redis.service.js');
jest.mock('../db/db.js');

describe('Blog Controller', () => {
    const mockUser = { _id: 'user123', email: 'test@example.com', firstName: 'John' };
    const token = 'mock_token';

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secret';
        redisClient.get.mockResolvedValue(null);
        jest.spyOn(jwt, 'verify').mockReturnValue({ email: mockUser.email });
        User.findOne.mockResolvedValue(mockUser);
    });

    describe('GET /api/blogs', () => {
        test('should return all blogs', async () => {
            const mockBlogs = [{ title: 'Blog 1' }, { title: 'Blog 2' }];
            Blog.find.mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockBlogs)
            }));

            const res = await request(app).get('/api/blogs');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockBlogs);
        });
    });

    describe('POST /api/blogs/create', () => {
        test('should create a new blog when authenticated', async () => {
            const blogData = { title: 'New Blog', content: 'Content' };
            Blog.prototype.save = jest.fn().mockResolvedValue({ ...blogData, author: mockUser._id });

            const res = await request(app)
                .post('/api/blogs/create')
                .set('Authorization', `Bearer ${token}`)
                .send(blogData);

            expect(res.status).toBe(201);
            expect(res.body.title).toBe(blogData.title);
        });

        test('should return 401 if user not found', async () => {
            User.findOne.mockResolvedValue(null);
            const res = await request(app)
                .post('/api/blogs/create')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'T', content: 'C' });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/blogs/:id', () => {
        test('should return 400 for invalid id', async () => {
            const res = await request(app).get('/api/blogs/invalid_id');
            expect(res.status).toBe(400);
        });

        test('should return 404 if blog not found', async () => {
            const id = '60d5ecb8b391f23456789012';
            Blog.findById.mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null)
            }));
            const res = await request(app).get(`/api/blogs/${id}`);
            expect(res.status).toBe(404);
        });
    });
});
