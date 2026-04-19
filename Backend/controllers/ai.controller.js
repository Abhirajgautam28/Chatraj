import * as ai from '../services/ai.service.js';
import { parseAiResponse } from '../utils/ai.js';


export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        if (typeof prompt !== 'string' || prompt.trim().length === 0) return res.status(400).json({ message: 'Prompt is required' });
        const result = await ai.generateResult(prompt);
        const responseText = parseAiResponse(result);
        res.json({ response: responseText });
    } catch (error) {
        console.error('getResult error:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}


export const postResult = async (req, res) => {
    try {
        const { prompt, userApiKey } = req.body;
        if (!prompt) {
            return res.status(400).json({ response: 'Prompt is required.' });
        }
        const result = await ai.generateResult(prompt, userApiKey);
        const responseText = parseAiResponse(result);
        res.json({ response: responseText });
    } catch (error) {
        console.error('postResult error:', error);
        res.status(500).json({ response: 'Internal server error' });
    }
}