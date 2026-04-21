import * as ai from '../services/ai.service.js';
import { parseAiResponse } from '../utils/ai.js';
import { logger } from '../utils/logger.js';
import { sendSuccess, sendError } from '../utils/response.utils.js';

export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        if (typeof prompt !== 'string' || prompt.trim().length === 0) return sendError(res, 400, 'Prompt is required');
        const result = await ai.generateResult(prompt);
        const responseText = parseAiResponse(result);
        sendSuccess(res, 200, { response: responseText });
    } catch (error) {
        logger.error('getResult error:', error);
        sendError(res, 500, 'Internal server error');
    }
}


export const postResult = async (req, res) => {
    try {
        const { prompt, userApiKey } = req.body;
        if (!prompt) {
            return sendError(res, 400, 'Prompt is required.');
        }
        const result = await ai.generateResult(prompt, userApiKey);
        const responseText = parseAiResponse(result);
        sendSuccess(res, 200, { response: responseText });
    } catch (error) {
        logger.error('postResult error:', error);
        sendError(res, 500, 'Internal server error');
    }
}