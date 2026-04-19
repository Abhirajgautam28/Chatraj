import { shouldExposeOtpToClient } from '../utils/security.js';

describe('shouldExposeOtpToClient', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('should return true when EXPOSE_OTP is true and CI is false', () => {
        process.env.EXPOSE_OTP = 'true';
        process.env.CI = 'false';
        expect(shouldExposeOtpToClient()).toBe(true);
    });

    test('should return false when EXPOSE_OTP is true but CI is true', () => {
        process.env.EXPOSE_OTP = 'true';
        process.env.CI = 'true';
        expect(shouldExposeOtpToClient()).toBe(false);
    });

    test('should return false when EXPOSE_OTP is not true', () => {
        process.env.EXPOSE_OTP = 'false';
        process.env.CI = 'false';
        expect(shouldExposeOtpToClient()).toBe(false);

        delete process.env.EXPOSE_OTP;
        expect(shouldExposeOtpToClient()).toBe(false);
    });

    test('should handle case insensitivity for EXPOSE_OTP', () => {
        process.env.EXPOSE_OTP = 'TRUE';
        process.env.CI = 'false';
        expect(shouldExposeOtpToClient()).toBe(true);
    });
});
