import {
  shouldExposeOtpToClient,
  isSecureFromRequest,
  signRawToken,
  verifySignedCsrfToken,
  createSignedCsrf,
  shouldBypassCsrf
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

    test('shouldBypassCsrf allows local automated registration flows', () => {
        process.env.NODE_ENV = 'development';
        process.env.CI = 'false';
        process.env.ALLOW_LOCAL_CSRF_BYPASS = 'true';
        expect(shouldBypassCsrf({ method: 'POST', path: '/api/users/register' })).toBe(true);
        expect(shouldBypassCsrf({ method: 'POST', path: '/api/users/verify-otp' })).toBe(true);
        expect(shouldBypassCsrf({ method: 'GET', path: '/api/users/debug/raw-otp' })).toBe(true);
    });
});
