import * as blogService from '../../../services/blog.service.js';
import Blog from '../../../models/blog.model.js';
import User from '../../../models/user.model.js';
import { generateResult } from '../../../services/ai.service.js';

jest.mock('../../../models/blog.model.js');
jest.mock('../../../models/user.model.js');
jest.mock('../../../services/ai.service.js');

describe('Blog Service', () => {
    afterEach(() => jest.clearAllMocks());

    test('createBlog should save new blog', async () => {
        User.findOne.mockResolvedValue({ _id: 'u1' });
        Blog.prototype.save = jest.fn().mockResolvedValue({ title: 'T' });
        const res = await blogService.createBlog({ title: 'T', content: 'C', userEmail: 't@e.com' });
        expect(res.title).toBe('T');
    });

    describe('generateBlogContent', () => {
        test('should throw error for empty topic', async () => {
            await expect(blogService.generateBlogContent('')).rejects.toThrow('Invalid topic');
            await expect(blogService.generateBlogContent('   ')).rejects.toThrow('Invalid topic');
        });

        test('should throw error for too long topic', async () => {
            const longTopic = 'a'.repeat(201);
            await expect(blogService.generateBlogContent(longTopic)).rejects.toThrow('Invalid topic');
        });

        test('should return parsed text from AI if result is valid JSON with text field', async () => {
            generateResult.mockResolvedValue(JSON.stringify({ text: 'AI generated content' }));
            const res = await blogService.generateBlogContent('Valid Topic');
            expect(res).toBe('AI generated content');
            expect(generateResult).toHaveBeenCalledWith(expect.stringContaining('Valid Topic'));
        });

        test('should return raw result if result is valid JSON but lacks text field', async () => {
            const rawJson = JSON.stringify({ other: 'data' });
            generateResult.mockResolvedValue(rawJson);
            const res = await blogService.generateBlogContent('Valid Topic');
            expect(res).toBe(rawJson);
        });

        test('should return raw result if AI returns non-JSON text', async () => {
            const rawText = 'Just some raw AI text';
            generateResult.mockResolvedValue(rawText);
            const res = await blogService.generateBlogContent('Valid Topic');
            expect(res).toBe(rawText);
        });
    });
});
