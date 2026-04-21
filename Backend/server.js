import http from 'http';
import 'dotenv/config';
import './patches/patch-validator-isURL.js';
import app from './app.js';
import connect from './db/db.js';
import { initializeSocket } from './services/socket.service.js';
import pingService from './services/ping.service.js';
import { logger } from './utils/logger.js';

const port = process.env.PORT || 8080;

// Enforce presence of critical environment variables in production-like runs.
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
    const enforce = process.env.NODE_ENV === 'production' || process.env.ENFORCE_REQUIRED_ENV === 'true';
    const msg = `Missing required environment variables: ${missing.join(', ')}. Please set them in your .env file or host environment before starting.`;
    if (enforce) {
        logger.error(msg);
        process.exit(1);
    } else {
        logger.warn(`${msg} Continuing because NODE_ENV !== 'production'. Set ENFORCE_REQUIRED_ENV=true to enforce in non-production environments.`);
    }
}

connect().catch(logger.error);

const server = http.createServer(app);
initializeSocket(server);

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use. Please try these solutions:`);
        logger.info('1. Stop any running server instances');
        logger.info('2. Choose a different port in .env file');
        logger.info('3. Run: taskkill /F /IM node.exe to force stop all Node processes');
    } else {
        logger.error('Server error:', error);
    }
    process.exit(1);
});

server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    if (process.env.NODE_ENV === 'production') {
        const backendUrl = process.env.BACKEND_URL || `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`;
        pingService(`${backendUrl}/health`);
    }
});
