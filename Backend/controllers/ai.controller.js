import * as ai from '../services/ai.service.js';


export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        const result = await ai.generateResult(prompt);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
}


export const postResult = async (req, res) => {
    try {
        const { prompt, userApiKey } = req.body;
        if (!prompt) {
            return res.status(400).json({ response: 'Prompt is required.' });
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
        res.status(500).json({ response: error.message });
    }
}