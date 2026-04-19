import {
  shouldExposeOtpToClient,
  isSecureFromRequest,
  signRawToken,
  verifySignedCsrfToken,
  createSignedCsrf
} from '../utils/security.js';
import crypto from 'crypto';

describe('Security Utilities', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('shouldExposeOtpToClient', () => {
        test('should return true when EXPOSE_OTP is true and CI is false', () => {
            process.env.EXPOSE_OTP = 'true';
            process.env.CI = 'false';
            expect(shouldExposeOtpToClient()).toBe(true);
        });

        test('should return false when CI is true', () => {
            process.env.EXPOSE_OTP = 'true';
            process.env.CI = 'true';
            expect(shouldExposeOtpToClient()).toBe(false);
        });
    });

    describe('isSecureFromRequest', () => {
        test('should return true if FORCE_SECURE_COOKIES is true', () => {
            process.env.FORCE_SECURE_COOKIES = 'true';
            expect(isSecureFromRequest({})).toBe(true);
        });

        test('should return true if NODE_ENV is production', () => {
            process.env.NODE_ENV = 'production';
            expect(isSecureFromRequest({})).toBe(true);
        });

        test('should return true if request is secure', () => {
            expect(isSecureFromRequest({ secure: true })).toBe(true);
        });

        test('should return true if x-forwarded-proto is https', () => {
            expect(isSecureFromRequest({ headers: { 'x-forwarded-proto': 'https' } })).toBe(true);
        });

        test('should return false otherwise', () => {
            expect(isSecureFromRequest({})).toBe(false);
        });
    });

    describe('CSRF Token Signing', () => {
        test('should sign and verify token', () => {
            process.env.CSRF_SIGNING_SECRET = 'secret';
            const token = createSignedCsrf();
            expect(verifySignedCsrfToken(token)).toBe(true);
        });

        test('should fail for invalid signature', () => {
            process.env.CSRF_SIGNING_SECRET = 'secret';
            const token = createSignedCsrf();
            const invalidToken = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
            expect(verifySignedCsrfToken(invalidToken)).toBe(false);
        });

        test('should fail for expired token', () => {
            process.env.CSRF_SIGNING_SECRET = 'secret';
            const past = Date.now() - (1000 * 60 * 61); // 61 mins ago
            const raw = `${past}:random`;
            const signed = signRawToken(raw);
            expect(verifySignedCsrfToken(signed)).toBe(false);
        });
    });
});
