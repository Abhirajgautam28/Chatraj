import { escapeRegex } from '../utils/strings.js';

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
