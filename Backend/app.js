import express from 'express';
import fs from 'fs';
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-XSRF-TOKEN', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie', 'Access-Control-Allow-Origin']
}));

// CORS preflight is handled by the global CORS middleware above

app.use(corsErrorLogger);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Development-only debug middleware to inspect CSRF headers/cookies on login route
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.path === '/api/users/login') {
      console.log('DEBUG CSRF - /api/users/login incoming', {
        method: req.method,
        headers: {
          'x-xsrf-token': req.headers['x-xsrf-token'],
          'x-csrf-token': req.headers['x-csrf-token'],
          'x-xsrf-token': req.headers['x-xsrf-token'],
          'x-xsrf-token-alt': req.headers['x-xsrf-token']
        },
        cookies: req.cookies
      });
    }
    next();
  });
}

// CSRF protection middleware using cookies
const csrfProtection = csurf({
  cookie: true,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS']
});

// Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
// Endpoint to retrieve CSRF token for clients (e.g., SPA frontends)
app.get('/csrf-token', csrfProtection, (req, res) => {
  try {
    const token = req.csrfToken();
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    };
    // csurf will set its own `_csrf` cookie when configured with `cookie: true`;
    // set a browser-friendly `XSRF-TOKEN` cookie too so axios can read it.
    res.cookie('XSRF-TOKEN', token, cookieOptions);
    res.status(200).json({ csrfToken: token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Conditional CSRF middleware:
// - For safe methods (GET/HEAD/OPTIONS) run csurf to generate a token and set
//   the `XSRF-TOKEN` cookie so browser JS (axios) can read it and send it back
//   as `X-XSRF-TOKEN` on state-changing requests.
// - For unsafe methods, run the csurf middleware to validate the token.
app.use((req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    // run csrfProtection to generate token for safe requests
    csrfProtection(req, res, (err) => {
      if (!err) {
        try {
          const token = req.csrfToken && req.csrfToken();
          if (token) {
            const cookieOptions = {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
            };
            res.cookie('XSRF-TOKEN', token, cookieOptions);
          }
        } catch (e) {
          // ignore token generation errors for safe methods
        }
      }
      next(err);
    });
  } else {
    // validate token for unsafe methods
    csrfProtection(req, res, next);
  }
});

app.use('/api/setup', setupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use("/api/ai", aiRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/blogs', blogRoutes);

// Development helper: mark a user as verified (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  app.post('/dev/verify-user', express.json(), async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    try {
      const userModel = (await import('./models/user.model.js')).default;
      const user = await userModel.findOne({ email: email.trim() });
      if (!user) return res.status(404).json({ error: 'User not found' });
      user.isVerified = true;
      user.otp = undefined;
      await user.save();
      return res.status(200).json({ message: 'User verified', email: user.email });
    } catch (err) {
      console.error('dev verify-user error:', err);
      return res.status(500).json({ error: 'Internal error' });
    }
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  // Handle CSRF errors specially
  if (err && (err.code === 'EBADCSRFTOKEN' || err.message === 'invalid csrf token')) {
    // Log CSRF failure details for debugging (development only)
    try {
      if (process.env.NODE_ENV !== 'production') {
        const debugDir = 'logs';
        if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir);
        const entry = {
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method,
          ip: req.ip,
          headers: {
            'x-xsrf-token': req.headers['x-xsrf-token'],
            'x-csrf-token': req.headers['x-csrf-token'],
            'x-xsrftoken': req.headers['x-xsrftoken'],
            authorization: req.headers['authorization']
          },
          cookies: req.cookies
        };
        fs.appendFileSync(`${debugDir}/csrf-debug.log`, JSON.stringify(entry) + '\n');
      }
    } catch (logErr) {
      console.error('Failed to write CSRF debug log:', logErr);
    }

    return res.status(403).json({
      error: 'Invalid CSRF token',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Forbidden'
    });
  }

  const status = err.status || 500;
  res.status(status).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

export default app;
