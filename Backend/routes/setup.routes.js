import { Router } from 'express';
import { requiredKeys } from '../config/required-keys.js';

const router = Router();

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

export default router;

// Serve dynamic sitemap if requested at backend root (useful when backend domain is the primary site)
router.get('/sitemap.xml', (req, res) => {
    try {
        const siteUrl = process.env.SITE_URL || process.env.BACKEND_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` || 'https://chatraj.vercel.app';
        const urls = [
            '/',
            '/categories',
            '/register',
            '/login',
            '/blogs'
        ];
        const xmlUrls = urls.map(u => `  <url>\n    <loc>${siteUrl.replace(/\/$/, '')}${u}\n    </loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n');
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`;
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).send('Failed to generate sitemap');
    }
});