import mongoose from 'mongoose';
import Blog from '../models/blog.model.js';

describe('Blog Model', () => {
    test('should create a valid blog object', () => {
        const userId = new mongoose.Types.ObjectId();
        const blogData = {
            title: 'Test Blog',
            content: 'Test Content',
            author: userId
        };
        const blog = new Blog(blogData);

        expect(blog.title).toBe('Test Blog');
        expect(blog.content).toBe('Test Content');
        expect(blog.author).toBe(userId);
        expect(blog.likes).toEqual([]);
        expect(blog.comments).toEqual([]);
    });

    test('should fail if required fields are missing', () => {
        const blog = new Blog({});
        const err = blog.validateSync();
        expect(err.errors.title).toBeDefined();
        expect(err.errors.content).toBeDefined();
        expect(err.errors.author).toBeDefined();
    });
});
