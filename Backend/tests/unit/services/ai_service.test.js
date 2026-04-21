import * as aiService from '../../../services/ai.service.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

jest.mock("@google/generative-ai");

describe('AI Service', () => {
    beforeEach(() => {
        process.env.GOOGLE_AI_KEY = 'test-key';
    });

    test('generateResult should return a message if key is missing', async () => {
        process.env.GOOGLE_AI_KEY = 'YOUR_API_KEY_HERE';
        const res = await aiService.generateResult('hi');
        expect(res).toContain('AI is not available');
    });

    test('generateResult should call Gemini and return text', async () => {
        const mockModel = {
            generateContent: jest.fn().mockResolvedValue({
                response: { text: () => '{"text": "hello"}' }
            })
        };
        GoogleGenerativeAI.prototype.getGenerativeModel = jest.fn().mockReturnValue(mockModel);

        const res = await aiService.generateResult('hi');
        expect(res).toBe('{"text": "hello"}');
        expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-key');
    });

    test('generateResult should handle errors gracefully', async () => {
        GoogleGenerativeAI.prototype.getGenerativeModel = jest.fn().mockImplementation(() => {
            throw new Error('API down');
        });
        const res = await aiService.generateResult('hi');
        expect(res).toContain('AI error: API down');
    });
});
