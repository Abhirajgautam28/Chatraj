import { normalizeEmail } from '../utils/email.js';

describe('Email Utility', () => {
  test('normalizeEmail should normalize valid emails', () => {
    expect(normalizeEmail(' TEST@Example.COM ')).toEqual({ value: 'TEST@example.com', isValid: true });
  });

  test('normalizeEmail should identify invalid emails', () => {
    expect(normalizeEmail('invalid-email')).toEqual({ value: null, isValid: false });
    expect(normalizeEmail(null)).toEqual({ value: null, isValid: false });
  });
});
