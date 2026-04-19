import { generateOTP } from '../utils/otp.js';

describe('generateOTP', () => {
    test('should generate OTP of default length 7', () => {
        const otp = generateOTP();
        expect(otp).toHaveLength(7);
    });

    test('should generate OTP of specified length', () => {
        const otp = generateOTP(10);
        expect(otp).toHaveLength(10);
    });

    test('should generate different OTPs each time', () => {
        const otp1 = generateOTP();
        const otp2 = generateOTP();
        expect(otp1).not.toBe(otp2);
    });

    test('should only contain allowed characters', () => {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
        const otp = generateOTP(100);
        for (const char of otp) {
            expect(chars).toContain(char);
        }
    });
});
