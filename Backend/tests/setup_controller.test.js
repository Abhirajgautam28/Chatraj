import request from 'supertest';
import app from '../app.js';
import Blog from '../models/blog.model.js';

jest.mock('../models/blog.model.js');
jest.mock('../db/db.js');

describe('Setup Routes', () => {
    describe('GET /api/setup/config-info', () => {
        test('should return configuration info', async () => {
            const res = await request(app).get('/api/setup/config-info');
            expect(res.status).toBe(200);
            expect(res.body.keys).toBeDefined();
            expect(res.body.keys.MONGODB_URI).toBeDefined();
        });
    });

    describe('GET /api/setup/sitemap.xml', () => {
        test('should return sitemap xml', async () => {
            Blog.find.mockImplementation(() => ({
                lean: jest.fn().mockResolvedValue([{ _id: 'blog123' }])
            }));

            const res = await request(app).get('/api/setup/sitemap.xml');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toBe('application/xml');
            expect(res.text).toContain('<urlset');
            expect(res.text).toContain('/blogs/blog123');
        });

        test('should handle DB error gracefully', async () => {
            Blog.find.mockImplementation(() => ({
                lean: jest.fn().mockRejectedValue(new Error('DB Down'))
            }));

            const res = await request(app).get('/api/setup/sitemap.xml');
            expect(res.status).toBe(200);
            expect(res.text).toContain('<urlset');
            // Should still have base URLs
            expect(res.text).toContain('<loc>');
        });
    });
});
