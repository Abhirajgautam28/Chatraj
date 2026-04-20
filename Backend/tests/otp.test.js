import { generateOTP } from '../utils/otp.js';

describe('OTP Utility', () => {
  test('generateOTP should generate OTP of correct length', () => {
    expect(generateOTP(7).length).toBe(7);
  });

  test('generateOTP should produce unique values', () => {
    const otp1 = generateOTP(7);
    const otp2 = generateOTP(7);
    expect(otp1).not.toBe(otp2);
  });
});
