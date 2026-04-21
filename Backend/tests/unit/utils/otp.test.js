import { generateOTP } from '../../../utils/otp.js';

describe('generateOTP', () => {
    test('should generate 7-char alphanumeric OTP by default', () => {
        const otp = generateOTP();
        expect(otp).toHaveLength(7);
    });

    test('should generate different OTPs', () => {
        expect(generateOTP()).not.toBe(generateOTP());
    });
});
