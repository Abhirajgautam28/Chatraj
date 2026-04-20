import { normalizeEmail } from '../../../utils/email.js';

describe('normalizeEmail', () => {
    test('should return valid for a normal email', () => {
        const result = normalizeEmail('test@example.com');
        expect(result).toEqual({ value: 'test@example.com', isValid: true });
    });

    test('should trim whitespace from both ends', () => {
        const result = normalizeEmail('  test@example.com  ');
        expect(result).toEqual({ value: 'test@example.com', isValid: true });
    });

    test('should lowercase the domain part', () => {
        const result = normalizeEmail('test@EXAMPLE.com');
        expect(result).toEqual({ value: 'test@example.com', isValid: true });
    });

    test('should preserve case of the local part', () => {
        const result = normalizeEmail('Test@example.com');
        expect(result).toEqual({ value: 'Test@example.com', isValid: true });
    });

    test('should return invalid for non-string inputs', () => {
        expect(normalizeEmail(null)).toEqual({ value: null, isValid: false });
        expect(normalizeEmail(123)).toEqual({ value: null, isValid: false });
    });

    test('should return invalid for malformed emails', () => {
        expect(normalizeEmail('testexample.com').isValid).toBe(false);
        expect(normalizeEmail('@example.com').isValid).toBe(false);
        expect(normalizeEmail('test@').isValid).toBe(false);
    });
});
