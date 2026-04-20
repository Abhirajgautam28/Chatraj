import * as ai from '../services/ai.service.js';
import { parseAiResponse } from '../utils/ai.js';
import response from '../utils/response.js';

export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        if (typeof prompt !== 'string' || prompt.trim().length === 0) {
            return response.error(res, 'Prompt is required', 400);
        }
        const result = await ai.generateResult(prompt);
        const responseText = parseAiResponse(result);
        return response.success(res, { response: responseText });
    } catch (err) {
        console.error('getResult error:', err);
        return response.error(res, 'Internal server error');
    }
}

export const postResult = async (req, res) => {
    try {
        const { prompt, userApiKey } = req.body;
        if (!prompt) {
            return response.error(res, 'Prompt is required', 400);
        }
        const result = await ai.generateResult(prompt, userApiKey);
        const responseText = parseAiResponse(result);
        return response.success(res, { response: responseText });
    } catch (err) {
        console.error('postResult error:', err);
        return response.error(res, 'Internal server error');
    }
}