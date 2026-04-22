import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/get-result', aiLimiter, aiController.getResult);

// Add POST / route for AI prompt
router.post('/', aiLimiter, aiController.postResult);

export default router;