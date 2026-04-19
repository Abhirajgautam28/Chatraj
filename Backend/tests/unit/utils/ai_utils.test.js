import { parseAiResponse } from '../../../utils/ai.js';

describe('AI Utilities', () => {
    test('should parse text from JSON or return string', () => {
        expect(parseAiResponse(JSON.stringify({ text: 'Hello' }))).toBe('Hello');
        expect(parseAiResponse({ text: 'World' })).toBe('World');
        expect(parseAiResponse('Plain')).toBe('Plain');
        expect(parseAiResponse(null)).toBe('null');
    });
});
