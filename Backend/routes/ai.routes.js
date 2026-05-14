import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authUser } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/get-result', authLimiter, authUser, aiController.getResult);

// Add POST / route for AI prompt
router.post('/', authLimiter, authUser, aiController.postResult);

export default router;
