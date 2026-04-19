import { parseAiResponse } from '../utils/ai.js';

describe('AI Utilities', () => {
    describe('parseAiResponse', () => {
        test('should parse stringified JSON with text property', () => {
            const input = JSON.stringify({ text: 'Hello' });
            expect(parseAiResponse(input)).toBe('Hello');
        });

        test('should handle object with text property', () => {
            const input = { text: 'World' };
            expect(parseAiResponse(input)).toBe('World');
        });

        test('should return stringified object if no text property', () => {
            const input = { foo: 'bar' };
            expect(parseAiResponse(input)).toBe(JSON.stringify(input));
        });

        test('should return raw string if not JSON', () => {
            const input = 'Not JSON';
            expect(parseAiResponse(input)).toBe('Not JSON');
        });

        test('should handle null/undefined gracefully', () => {
            expect(parseAiResponse(null)).toBe('null');
            expect(parseAiResponse(undefined)).toBe('undefined');
        });
    });
});
