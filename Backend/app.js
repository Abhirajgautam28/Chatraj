import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import setupRoutes from './routes/setup.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import blogRoutes from './routes/blog.routes.js';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger.js';
import { configureCors, corsErrorLogger } from './config/cors.js';
import {
  csrfProtection,
  getCsrfTokenController,
  conditionalCsrfMiddleware,
  csrfErrorHandler
} from './middleware/csrf.js';

const app = express();

// Apply CORS as the very first middleware
app.use(configureCors());

// CORS preflight is handled by the global CORS middleware above
app.use(corsErrorLogger);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
if (process.env.NODE_ENV !== 'test') {
  app.get('/csrf-token', csrfProtection, getCsrfTokenController);
}

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Conditional CSRF middleware.
if (process.env.NODE_ENV === 'test') {
  app.use((req, res, next) => next());
} else {
  app.use(conditionalCsrfMiddleware);
}

app.use('/api/setup', setupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blogs', blogRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack);

  // Use specialized CSRF error handler
  csrfErrorHandler(err, req, res, (nextErr) => {
    const status = nextErr.status || 500;
    res.status(status).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? nextErr.message : 'Internal Server Error'
    });
  });
});

export default app;
