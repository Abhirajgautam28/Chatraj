import { generateResult } from '../services/ai.service.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

jest.mock("@google/generative-ai");

describe('AI Service', () => {
    const prompt = 'Hello';
    const mockApiKey = 'mock-api-key';

    test('should return fallback if no API key is provided', async () => {
        delete process.env.GOOGLE_AI_KEY;
        const result = await generateResult(prompt);
        const parsed = JSON.parse(result);
        expect(parsed.text).toContain('AI is not available');
        expect(parsed.fileTree).toBeNull();
    });

    test('should return AI error if generation fails', async () => {
        const mockModel = {
            generateContent: jest.fn().mockRejectedValue(new Error('API failed'))
        };
        const mockGenAI = {
            getGenerativeModel: jest.fn().mockReturnValue(mockModel)
        };
        GoogleGenerativeAI.mockImplementation(() => mockGenAI);

        const result = await generateResult(prompt, mockApiKey);
        const parsed = JSON.parse(result);
        expect(parsed.text).toContain('AI error: API failed');
        expect(parsed.fileTree).toBeNull();
    });

    test('should return generated content successfully', async () => {
        const mockResponse = {
            response: {
                text: jest.fn().mockReturnValue(JSON.stringify({ text: 'AI response' }))
            }
        };
        const mockModel = {
            generateContent: jest.fn().mockResolvedValue(mockResponse)
        };
        const mockGenAI = {
            getGenerativeModel: jest.fn().mockReturnValue(mockModel)
        };
        GoogleGenerativeAI.mockImplementation(() => mockGenAI);

        const result = await generateResult(prompt, mockApiKey);
        const parsed = JSON.parse(result);
        expect(parsed.text).toBe('AI response');
    });
});
