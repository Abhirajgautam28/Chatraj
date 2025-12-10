#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Determine site URL from environment (Vite expects VITE_ prefix for client, but build scripts can use SITE_URL)
const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://chatraj.vercel.app';

const urls = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/categories', changefreq: 'weekly', priority: '0.8' },
  { path: '/register', changefreq: 'monthly', priority: '0.6' },
  { path: '/login', changefreq: 'monthly', priority: '0.6' },
  { path: '/blogs', changefreq: 'weekly', priority: '0.7' }
];

const entries = urls.map(u => {
  const loc = `${siteUrl.replace(/\/$/, '')}${u.path}`;
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');

fs.writeFileSync(outPath, xml, { encoding: 'utf8' });
console.log(`Generated sitemap at ${outPath} with site URL: ${siteUrl}`);
