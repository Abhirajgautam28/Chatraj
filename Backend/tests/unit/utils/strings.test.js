import { escapeRegex, escapeHtml, maskKey } from '../../../utils/strings.js';

describe('String Utilities', () => {
    describe('escapeRegex', () => {
        test('should escape special regex characters', () => {
            expect(escapeRegex('.*+?')).toBe('\\.\\*\\+\\?');
        });
        test('should handle non-string inputs', () => {
            expect(escapeRegex(123)).toBe('123');
            expect(escapeRegex(null)).toBe('null');
        });
    });

    describe('escapeHtml', () => {
        test('should escape HTML characters', () => {
            expect(escapeHtml('<script>alert("1")</script>')).toBe('&lt;script&gt;alert(&quot;1&quot;)&lt;/script&gt;');
        });
        test('should return empty string for null/undefined', () => {
            expect(escapeHtml(null)).toBe('');
            expect(escapeHtml(undefined)).toBe('');
        });
    });

    describe('maskKey', () => {
        test('should mask sensitive keys', () => {
            expect(maskKey('123456789012')).toBe('123...012');
            expect(maskKey('verylongkeyformasking')).toBe('verylo...asking');
        });
    });
});
