import { GoogleGenerativeAI } from "@google/generative-ai";

const CLIENTS = new Map();

export const generateResult = async (prompt, userApiKey) => {
    const apiKey = userApiKey || process.env.GOOGLE_AI_KEY;
    if (!apiKey) return JSON.stringify({ text: 'AI Key missing', fileTree: null });

    if (!CLIENTS.has(apiKey)) CLIENTS.set(apiKey, new GoogleGenerativeAI(apiKey));
    const genAI = CLIENTS.get(apiKey);

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json", temperature: 0.3 }
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        return JSON.stringify({ text: "AI error", error: err.message });
    }
}

// Zenith Feature: Streaming AI Generation
export const generateResultStream = async (prompt, userApiKey, onChunk) => {
    const apiKey = userApiKey || process.env.GOOGLE_AI_KEY;
    if (!apiKey) return;

    if (!CLIENTS.has(apiKey)) CLIENTS.set(apiKey, new GoogleGenerativeAI(apiKey));
    const genAI = CLIENTS.get(apiKey);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            onChunk(chunkText);
        }
    } catch (err) {
        console.error("[AI STREAM] Error:", err.message);
    }
}
