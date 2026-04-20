import {
  shouldExposeOtpToClient,
  isSecureFromRequest,
  signRawToken,
  verifySignedCsrfToken,
  createSignedCsrf
} from '../../utils/security.js';

describe('Security Utilities', () => {
    const originalEnv = process.env;
    beforeEach(() => { process.env = { ...originalEnv }; });
    afterAll(() => { process.env = originalEnv; });

    test('shouldExposeOtpToClient logic', () => {
        process.env.EXPOSE_OTP = 'true';
        process.env.CI = 'false';
        expect(shouldExposeOtpToClient()).toBe(true);
        process.env.CI = 'true';
        expect(shouldExposeOtpToClient()).toBe(false);
    });

    test('isSecureFromRequest logic', () => {
        expect(isSecureFromRequest({ secure: true })).toBe(true);
        expect(isSecureFromRequest({ headers: { 'x-forwarded-proto': 'https' } })).toBe(true);
    });

    test('CSRF signing and verification', () => {
        process.env.CSRF_SIGNING_SECRET = 'secret';
        const token = createSignedCsrf();
        expect(verifySignedCsrfToken(token)).toBe(true);
    });
});
