import { normalizeEmail } from '../utils/email.js';

describe('Email Utilities', () => {
    test('normalizeEmail should lowercase the domain', () => {
        const input = 'User@EXAMPLE.com';
        const { value, isValid } = normalizeEmail(input);
        expect(isValid).toBe(true);
        expect(value).toBe('User@example.com');
    });

    test('normalizeEmail should handle invalid emails', () => {
        const input = 'not-an-email';
        const { isValid } = normalizeEmail(input);
        expect(isValid).toBe(false);
    });

    test('normalizeEmail should trim whitespace', () => {
        const input = '  test@example.com  ';
        const { value, isValid } = normalizeEmail(input);
        expect(isValid).toBe(true);
        expect(value).toBe('test@example.com');
    });
});
