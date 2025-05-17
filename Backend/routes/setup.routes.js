import { Router } from 'express';
import { requiredKeys } from '../config/required-keys.js';

const router = Router();

router.get('/config-info', (req, res) => {
    try {
        const safeKeys = Object.entries(requiredKeys).reduce((acc, [key, value]) => {
            acc[key] = {
                name: value.name,
                description: value.description
            };
            return acc;
        }, {});
        
        res.json({ keys: safeKeys });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch configuration information' });
    }
});

export default router;