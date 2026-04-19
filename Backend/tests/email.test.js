import { normalizeEmail } from '../utils/email.js';

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
        expect(normalizeEmail({})).toEqual({ value: null, isValid: false });
        expect(normalizeEmail(undefined)).toEqual({ value: null, isValid: false });
    });

    test('should return invalid for email without @', () => {
        const result = normalizeEmail('testexample.com');
        expect(result).toEqual({ value: null, isValid: false });
    });

    test('should return invalid for email with multiple @', () => {
        const result = normalizeEmail('test@extra@example.com');
        expect(result).toEqual({ value: null, isValid: false });
    });

    test('should return invalid for email without dot in domain', () => {
        const result = normalizeEmail('test@example');
        expect(result).toEqual({ value: 'test@example', isValid: false });
    });

    test('should return invalid for empty local part', () => {
        const result = normalizeEmail('@example.com');
        expect(result).toEqual({ value: '@example.com', isValid: false });
    });

    test('should return invalid for empty domain part', () => {
        const result = normalizeEmail('test@');
        expect(result).toEqual({ value: 'test@', isValid: false });
    });

    test('should return invalid for emails with spaces in the middle', () => {
        const result = normalizeEmail('test @example.com');
        expect(result).toEqual({ value: 'test @example.com', isValid: false });
    });
});
