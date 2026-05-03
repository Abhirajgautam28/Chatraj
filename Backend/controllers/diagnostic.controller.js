import mongoose from 'mongoose';
import redisClient from '../services/redis.service.js';
import aiService from '../services/ai.service.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import { logger } from '../utils/logger.js';

// Middleware to verify DEV_UI_PASSWORD
export const verifyDevPassword = (req, res, next) => {
    const providedPassword = req.headers['x-dev-password'];
    const expectedPassword = process.env.DEV_UI_PASSWORD;

    if (!expectedPassword) {
        return res.status(500).json({ error: 'DEV_UI_PASSWORD environment variable is not configured on the server.' });
    }

    if (providedPassword !== expectedPassword) {
        return res.status(401).json({ error: 'Unauthorized. Invalid password.' });
    }

    next();
};

export const pingBackend = (req, res) => {
    res.json({ status: 'ok', message: 'Backend is reachable.' });
};

export const checkMetrics = (req, res) => {
    const memUsage = process.memoryUsage();
    res.json({
        status: 'ok',
        message: 'System metrics fetched.',
        metrics: {
            uptime: process.uptime(),
            nodeVersion: process.version,
            memory: {
                rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
                external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
            }
        }
    });
};

export const checkDatabase = async (req, res) => {
    try {
        const state = mongoose.connection.readyState;
        const states = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting',
        };
        const statusText = states[state] || 'Unknown';

        if (state === 1) {
            // Do a simple query
            await mongoose.connection.db.admin().ping();
            res.json({ status: 'ok', message: `Database is ${statusText}. Ping successful.` });
        } else {
            res.status(500).json({ error: `Database is currently ${statusText}` });
        }
    } catch (err) {
        logger.error('Diagnostic DB error:', err);
        res.status(500).json({ error: err.message || 'Database connection error' });
    }
};

export const checkRedis = async (req, res) => {
    try {
        if (!redisClient) {
            return res.status(500).json({ error: 'Redis client is not initialized.' });
        }

        // Use a test key
        const testKey = 'diagnostic:test';
        await redisClient.set(testKey, 'ok', 'EX', 10);
        const val = await redisClient.get(testKey);

        if (val === 'ok') {
            res.json({ status: 'ok', message: 'Redis is connected and responding.' });
        } else {
            res.status(500).json({ error: 'Redis returned unexpected value.' });
        }
    } catch (err) {
        logger.error('Diagnostic Redis error:', err);
        res.status(500).json({ error: err.message || 'Redis connection error' });
    }
};

export const clearRedisCache = async (req, res) => {
    try {
        if (!redisClient) {
            return res.status(500).json({ error: 'Redis client is not initialized.' });
        }

        // This clears all keys in the current database.
        // Use with caution, but acceptable for a dev-only diagnostic route.
        await redisClient.flushdb();
        res.json({ status: 'ok', message: 'Redis cache cleared successfully.' });
    } catch (err) {
        logger.error('Diagnostic Redis flush error:', err);
        res.status(500).json({ error: err.message || 'Redis flush error' });
    }
};

export const checkAI = async (req, res) => {
    try {
        const prompt = "Reply with 'ok' and nothing else.";
        const result = await aiService.generateResult(prompt);
        // We do not return the full result object to prevent exposing internal state.
        const isOk = result && result.includes('ok');
        res.json({ status: 'ok', message: `AI Service responded successfully. Echo ok: ${isOk}` });
    } catch (err) {
        logger.error('Diagnostic AI error:', err);
        res.status(500).json({ error: err.message || 'AI Service connection error' });
    }
};

export const checkEnv = (req, res) => {
    // List of important env vars for this application
    const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'GOOGLE_AI_KEY'];
    const optionalVars = ['REDIS_URL', 'REDIS_HOST', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SENDGRID_API_KEY'];

    const checkVar = (key) => {
        const val = process.env[key];
        return {
            present: !!val,
            length: val ? val.length : 0,
            preview: val ? `${val.substring(0, 3)}***` : null
        };
    };

    const envStatus = {
        required: {},
        optional: {}
    };

    requiredVars.forEach(v => { envStatus.required[v] = checkVar(v); });
    optionalVars.forEach(v => { envStatus.optional[v] = checkVar(v); });

    res.json({
        status: 'ok',
        message: 'Environment configuration fetched successfully.',
        environment: envStatus
    });
};

export const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email address is required for test.' });
        }

        const mailOptions = {
            to: email,
            subject: 'ChatRaj Diagnostic Test Email',
            text: 'If you are receiving this, the ChatRaj email configuration is working.',
            html: '<p>If you are receiving this, the ChatRaj email configuration is working.</p>'
        };

        const info = await sendMailWithRetry(mailOptions);
        res.json({ status: 'ok', message: 'Email sent successfully.', info });
    } catch (err) {
        logger.error('Diagnostic Email error:', err);
        res.status(500).json({ error: err.message || 'Email sending error' });
    }
};
