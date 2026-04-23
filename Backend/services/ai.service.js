import { GoogleGenerativeAI } from "@google/generative-ai";
import { withCache } from "../utils/cache.js";
import crypto from "crypto";
import { logger } from "../utils/logger.js";

const genAIInstances = new Map();

const getGenAIInstance = (apiKey) => {
    if (!genAIInstances.has(apiKey)) {
        genAIInstances.set(apiKey, new GoogleGenerativeAI(apiKey));
    }
    return genAIInstances.get(apiKey);
};

export const generateResult = async (prompt, userApiKey) => {
    const apiKey = userApiKey || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        return JSON.stringify({
            text: 'AI is not available. Please set a valid GOOGLE_AI_KEY in your backend .env file.',
            fileTree: null
        });
    }

    const promptHash = crypto.createHash('md5').update(prompt).digest('hex');
    const cacheKey = "ai_response:" + promptHash;

    return await withCache(cacheKey, 3600, async () => {
        try {
            const genAI = getGenAIInstance(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
                systemInstruction: "You are an expert full-stack developer. Provide modular, production-ready code. Always handle errors. If the user asks for code, provide a fileTree object."
            });

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            logger.error('Gemini API Error:', err.message);
            throw err;
        }
    });
};
