import * as ai from '../services/ai.service.js';
import { logger } from '../utils/logger.js';


export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        if (typeof prompt !== 'string' || prompt.trim().length === 0) {
            return response.error(res, 'Prompt is required', 400);
        }
        res.json({ response: responseText });
    } catch (error) {
        logger.error('getResult error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const postResult = async (req, res) => {
    try {
        const { prompt, userApiKey } = req.body;
        if (!prompt) {
            return response.error(res, 'Prompt is required', 400);
        }
        const result = await ai.generateResult(prompt, userApiKey);
        // If result is a stringified object, parse it
        let responseText;
        try {
            const parsed = typeof result === 'string' ? JSON.parse(result) : result;
            // If parsed has a 'text' property, use it; else, use the whole parsed object as string
            responseText = parsed.text || JSON.stringify(parsed);
        } catch (e) {
            responseText = typeof result === 'string' ? result : JSON.stringify(result);
        }
        res.json({ response: responseText });
    } catch (error) {
        logger.error('postResult error:', error);
        res.status(500).json({ response: 'Internal server error' });
    }
}