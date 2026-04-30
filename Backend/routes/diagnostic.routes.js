import { Router } from 'express';
import {
    verifyDevPassword,
    pingBackend,
    checkDatabase,
    checkRedis,
    checkAI,
    checkEmail
} from '../controllers/diagnostic.controller.js';

const router = Router();

// All routes require the developer password
router.use(verifyDevPassword);

router.get('/ping', pingBackend);
router.get('/db', checkDatabase);
router.get('/redis', checkRedis);
router.get('/ai', checkAI);
router.post('/email', checkEmail);

export default router;