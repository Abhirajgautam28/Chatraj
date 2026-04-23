import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import setupRoutes from './routes/setup.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import blogRoutes from './routes/blog.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csurf from 'csurf';
import crypto from 'crypto';

const app = express();

app.disable('x-powered-by'); // Security + Micro-optimization

// Request Timeout Middleware (30s)
app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        res.status(408).send('Request Timeout');
    });
    next();
});

const CSRF_SIGNING_SECRET = process.env.CSRF_SIGNING_SECRET || 'dev-secret';

function signRawToken(raw) {
  return `${raw}.${crypto.createHmac('sha256', CSRF_SIGNING_SECRET).update(raw).digest('base64url')}`;
}

function verifySignedCsrfToken(signed) {
  try {
    const [raw, sig] = signed.split('.');
    const expected = crypto.createHmac('sha256', CSRF_SIGNING_SECRET).update(raw).digest('base64url');
    if (sig !== expected) return false;
    const ts = Number(raw.split(':')[0]);
    if (Date.now() - ts > 3600000) return false;
    return true;
  } catch (e) { return false; }
}

app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-SIGNED']
}));

app.use(morgan('dev'));

const hotAssets = ['/favicon.ico', '/manifest.json'];
app.use((req, res, next) => {
  if (req.method === 'GET' && hotAssets.includes(req.path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

const csrfProtection = csurf({ cookie: true, ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] });

if (process.env.NODE_ENV !== 'test') {
  app.get('/csrf-token', csrfProtection, (req, res) => {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    res.status(200).json({ csrfToken: token, signedCsrf: signRawToken(`${Date.now()}:${crypto.randomBytes(12).toString('base64url')}`) });
  });
}

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/setup', setupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blogs', blogRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
      res.status(err.status || 500).json({ error: 'Internal Server Error' });
  }
});

export default app;
