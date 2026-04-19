import { escapeRegex, escapeHtml, maskKey } from '../utils/strings.js';

describe('String Utilities', () => {
    describe('escapeRegex', () => {
        test('should escape special regex characters', () => {
            const input = '.*+?^${}()|[Requested-File]\\';
            const expected = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[Requested-File\\]\\\\';
            expect(escapeRegex(input)).toBe(expected);
        });

        test('should return normal string if no special characters', () => {
            const input = 'NormalString123';
            expect(escapeRegex(input)).toBe(input);
        });

        test('should convert non-string inputs to string and escape', () => {
            expect(escapeRegex(123)).toBe('123');
            expect(escapeRegex(true)).toBe('true');
        });

        test('should throw TypeError for null or undefined', () => {
            expect(() => escapeRegex(null)).toThrow(TypeError);
            expect(() => escapeRegex(undefined)).toThrow(TypeError);
        });
    });

    describe('escapeHtml', () => {
        test('should escape HTML special characters', () => {
            const input = '<div class="test">"Hello" & '\''World'\''</div>';
            const expected = '&lt;div class=&quot;test&quot;&gt;&quot;Hello&quot; &amp; &#039;World&#039;&lt;/div&gt;';
            expect(escapeHtml(input)).toBe(expected);
        });

        test('should return empty string for null or undefined', () => {
            expect(escapeHtml(null)).toBe('');
            expect(escapeHtml(undefined)).toBe('');
        });

        test('should handle normal strings', () => {
            expect(escapeHtml('Hello World')).toBe('Hello World');
        });
    });

    describe('maskKey', () => {
        test('should mask short keys (<= 12 chars)', () => {
            expect(maskKey('123456')).toBe('123...456');
            expect(maskKey('123456789012')).toBe('123...012');
        });

        test('should mask long keys (> 12 chars)', () => {
            expect(maskKey('1234567890123')).toBe('123456...890123');
            expect(maskKey('verylongredistokenmorethan12chars')).toBe('verylo...2chars');
        });

        test('should return empty string for falsy input', () => {
            expect(maskKey('')).toBe('');
            expect(maskKey(null)).toBe('');
        });

        test('should handle non-string inputs', () => {
            expect(maskKey(123456789012345)).toBe('123456...012345');
        });
    });
});
