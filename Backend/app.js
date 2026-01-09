import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import setupRoutes from './routes/setup.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import blogRoutes from './routes/blog.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csurf from 'csurf';
const allowedOrigins = [
  'https://chatraj-frontend.vercel.app',
  'https://chatraj.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://chatraj-fpo1pa3bz-abhiraj-gautams-projects.vercel.app'
];


const app = express();

// CORS debug logger
const corsErrorLogger = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    console.error('CORS error:', err.message, 'Origin:', req.headers.origin);
    res.status(403).json({ error: 'CORS error', details: err.message });
  } else {
    next(err);
  }
};

// Improved CORS middleware for Vercel/Render/localhost
const dynamicCors = (origin, callback) => {
  const vercelRegex = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;
  if (!origin) return callback(null, true);
  if (
    allowedOrigins.includes(origin) ||
    vercelRegex.test(origin) ||
    origin === 'null'
  ) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
};

// Apply CORS as the very first middleware
app.use(cors({
  origin: dynamicCors,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie', 'Access-Control-Allow-Origin']
}));

// CORS preflight is handled by the global CORS middleware above

app.use(corsErrorLogger);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF protection middleware using cookies
const csrfProtection = csurf({
  cookie: true,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Apply CSRF protection to all subsequent routes
app.use(csrfProtection);

app.use('/api/setup', setupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blogs', blogRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

export default app;
