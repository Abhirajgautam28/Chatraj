import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
    verifyDevPassword,
    pingBackend,
    checkDatabase,
    checkRedis,
    checkAI,
    checkEmail,
    checkEnv,
    checkMetrics,
    clearRedisCache
} from '../controllers/diagnostic.controller.js';

const router = Router();

// Add rate limiter for diagnostic routes to mitigate brute force
const diagnosticLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 requests per window
  message: { error: 'Too many diagnostic requests, please try again later.' }
});

router.use(diagnosticLimiter);

// All routes require the developer password
router.use(verifyDevPassword);

router.get('/ping', pingBackend);
router.get('/env', checkEnv);
router.get('/metrics', checkMetrics);
router.get('/db', checkDatabase);
router.get('/redis', checkRedis);
router.post('/redis/clear', clearRedisCache);
router.get('/ai', checkAI);
router.post('/email', checkEmail);

export default router;