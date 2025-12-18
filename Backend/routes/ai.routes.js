import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
const router = Router();

router.get('/get-result', aiController.getResult);

// Add POST / route for AI prompt
router.post('/', aiController.postResult);

export default router;