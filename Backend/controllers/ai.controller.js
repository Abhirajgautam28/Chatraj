import * as ai from '../services/ai.service.js';
import { withCache } from '../utils/cache.js';

export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        if (typeof prompt !== 'string' || prompt.trim().length === 0) return res.status(400).json({ message: 'Prompt is required' });

        const cacheKey = `ai:prompt:${Buffer.from(prompt.trim()).toString('base64')}`;
        const result = await withCache(cacheKey, 3600 * 24, async () => {
            return await ai.generateResult(prompt);
        }, ['ai:prompt']);

        // If result is a stringified object, parse it
        let responseText;
        try {
            const parsed = typeof result === 'string' ? JSON.parse(result) : result;
            responseText = parsed.text || JSON.stringify(parsed);
        } catch (e) {
            responseText = typeof result === 'string' ? result : JSON.stringify(result);
        }
        res.json({ response: responseText });
    } catch (error) {
        console.error('getResult error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

export const postResult = async (req, res) => {
    try {
        const { prompt, userApiKey } = req.body;
        if (!prompt) return res.status(400).json({ response: 'Prompt is required.' });

        // Don't cache user-provided key requests for security/privacy
        const result = await ai.generateResult(prompt, userApiKey);

        let responseText;
        try {
            const parsed = typeof result === 'string' ? JSON.parse(result) : result;
            responseText = parsed.text || JSON.stringify(parsed);
        } catch (e) {
            responseText = typeof result === 'string' ? result : JSON.stringify(result);
        }
        res.json({ response: responseText });
    } catch (error) {
        console.error('postResult error:', error);
        res.status(500).json({ response: 'Internal server error' });
    }
}
