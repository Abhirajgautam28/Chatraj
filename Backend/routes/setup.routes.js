import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requiredKeys } from '../config/required-keys.js';
import Blog from '../models/blog.model.js';

// initialize router
const router = Router();

// Rate limiter for sitemap route (e.g., 10 requests per minute per IP)
const sitemapLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.get('/config-info', (req, res) => {
    try {
        const safeKeys = Object.entries(requiredKeys).reduce((acc, [key, value]) => {
            acc[key] = {
                name: value.name,
                description: value.description
            };
            return acc;
        }, {});
        
        res.json({ keys: safeKeys });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch configuration information' });
    }
});

// Serve dynamic sitemap including blog pages (by id)
router.get('/sitemap.xml', sitemapLimiter, async (req, res) => {
    try {
        const siteUrl = process.env.SITE_URL || process.env.BACKEND_URL || (process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : null) || 'https://chatraj.vercel.app';
        // base pages
        const urls = [
            '/',
            '/categories',
            '/register',
            '/login',
            '/blogs'
        ];

        // include blog detail pages by id
        let blogIds = [];
        try {
            const blogs = await Blog.find({}, '_id').lean();
            blogIds = blogs.map(b => String(b._id));
        } catch (e) {
            // If DB is not reachable, continue with base urls only
            console.warn('Could not fetch blogs for sitemap:', e.message || e);
        }

        const allUrls = urls.concat(blogIds.map(id => `/blogs/${id}`));

        const xmlUrls = allUrls.map(u => `  <url>\n    <loc>${siteUrl.replace(/\/$/, '')}${u}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`;
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).send('Failed to generate sitemap');
    }
});

export default router;