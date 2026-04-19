import request from 'supertest';
import app from '../app.js';
import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';
import mongoose from 'mongoose';

jest.mock('../models/blog.model.js');
jest.mock('../models/user.model.js');
jest.mock('../services/redis.service.js');
jest.mock('../db/db.js');

describe('Blog Flow Integration', () => {
    const mockUser = { _id: new mongoose.Types.ObjectId().toString(), email: 'author@example.com' };
    const token = 'valid_token';

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'secret';
        redisClient.get.mockResolvedValue(null);
        jest.spyOn(jwt, 'verify').mockReturnValue({ email: mockUser.email, _id: mockUser._id });
        User.findOne.mockResolvedValue(mockUser);
    });

    test('should create, then like, then comment on a blog', async () => {
        const blogId = new mongoose.Types.ObjectId().toString();
        const blogData = { title: 'Flow Title', content: 'Flow Content' };

        // 1. Create
        Blog.prototype.save = jest.fn().mockResolvedValue({ ...blogData, _id: blogId, author: mockUser._id, likes: [], comments: [] });
        const createRes = await request(app)
            .post('/api/blogs/create')
            .set('Authorization', `Bearer ${token}`)
            .send(blogData);
        expect(createRes.status).toBe(201);

        // 2. Like
        const mockBlog = {
            _id: blogId,
            likes: [],
            save: jest.fn().mockResolvedValue({ _id: blogId, likes: [mockUser._id] })
        };
        Blog.findById.mockResolvedValue(mockBlog);
        const likeRes = await request(app)
            .post(`/api/blogs/like/${blogId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(likeRes.status).toBe(200);

        // 3. Comment
        const commentData = { text: 'Great flow!' };
        mockBlog.comments = [];
        const commentRes = await request(app)
            .post(`/api/blogs/comment/${blogId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(commentData);
        expect(commentRes.status).toBe(201);
    });
});
