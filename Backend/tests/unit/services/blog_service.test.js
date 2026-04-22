import { createBlog, getAllBlogs, likeBlog } from '../../../services/blog.service.js';
import Blog from '../../../models/blog.model.js';
import User from '../../../models/user.model.js';
import mongoose from 'mongoose';

jest.mock('../../../models/blog.model.js');
jest.mock('../../../models/user.model.js');

describe('Blog Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createBlog', () => {
        test('should create a blog with valid user', async () => {
            const userId = new mongoose.Types.ObjectId();
            User.findOne.mockResolvedValue({ _id: userId });

            const mockSave = jest.fn().mockResolvedValue(true);
            Blog.mockImplementation(() => ({
                save: mockSave,
                _id: 'blog1'
            }));

            await createBlog({ title: 'T', content: 'C', userEmail: 'test@test.com' });
            expect(User.findOne).toHaveBeenCalledWith({ email: 'test@test.com' });
            expect(mockSave).toHaveBeenCalled();
        });

        test('should throw if user not found', async () => {
            User.findOne.mockResolvedValue(null);
            await expect(createBlog({ title: 'T', content: 'C', userEmail: 'x@x.com' }))
                .rejects.toThrow('User not found');
        });
    });

    describe('likeBlog', () => {
        test('should toggle like on a blog', async () => {
            const blogId = new mongoose.Types.ObjectId();
            const userId = new mongoose.Types.ObjectId();

            const mockBlog = {
                _id: blogId,
                likes: [],
                save: jest.fn().mockResolvedValue(true)
            };

            Blog.findById.mockResolvedValue(mockBlog);
            User.findOne.mockResolvedValue({ _id: userId });

            // Like
            await likeBlog(blogId, 'u@u.com');
            expect(mockBlog.likes).toContain(userId);

            // Unlike
            await likeBlog(blogId, 'u@u.com');
            expect(mockBlog.likes).not.toContain(userId);
        });
    });
});
