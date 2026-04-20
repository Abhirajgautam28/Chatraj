import { GoogleGenerativeAI } from "@google/generative-ai"
import { withCache } from '../utils/cache.js';
import crypto from 'crypto';

const genAICache = new Map();

// If GOOGLE_AI_KEY is not set, return a fallback response
export const generateResult = async (prompt, userApiKey) => {
    // Optimization: Cache AI responses to same prompts
    const promptHash = crypto.createHash('md5').update(prompt).digest('hex');
    const cacheKey = `ai:response:${promptHash}`;

    return await withCache(cacheKey, 3600 * 24, async () => {
    const apiKey = userApiKey || process.env.GOOGLE_AI_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        return JSON.stringify({
            text: 'AI is not available. Please set a valid GOOGLE_AI_KEY in your backend .env file or provide a valid user key.',
            fileTree: null
        });
    }
    try {
        let genAI = genAICache.get(apiKey);
        if (!genAI) {
            genAI = new GoogleGenerativeAI(apiKey);
            genAICache.set(apiKey, genAI);
        }
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4,
            },
            systemInstruction: `Expert MERN dev (10yrs). Write modular, documented, scalable code. Handle errors. Examples:
<example>
user:Create express app
response:{"text":"Express server tree","fileTree":{"app.js":{"file":{"contents":"const express=require('express');const app=express();app.get('/',(req,res)=>res.send('Hello World!'));app.listen(3000);"}},"package.json":{"file":{"contents":"{\"name\":\"temp-server\",\"dependencies\":{\"express\":\"^4.21.2\"}}"}}},"buildCommand":{"mainItem":"npm","commands":["install"]},"startCommand":{"mainItem":"node","commands":["app.js"]}}
</example>
<example>
user:Hello
response:{"text":"Hello, how can I help?"}
</example>
IMPORTANT:No routes/index.js`
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        // Do not cache error responses
        throw err;
    }
    }, [`ai:responses`]).catch(err => {
         return JSON.stringify({
            text: 'AI error: ' + (err.message || 'Unknown error'),
            fileTree: null
        });
    });
}