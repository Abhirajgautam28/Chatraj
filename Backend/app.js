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

const allowedOrigins = [
  'https://chatraj-frontend.vercel.app',
  'https://chatraj.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

connect().catch(console.error);

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

// Explicitly handle preflight OPTIONS requests for all routes
app.options('*', cors({
  origin: dynamicCors,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie', 'Access-Control-Allow-Origin']
}));

app.use(corsErrorLogger);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

app.use('/setup', setupRoutes);
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use("/ai", aiRoutes);
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
