import crypto from 'crypto';

/**
 * Centralized OTP generation logic.
 * @param {number} length - Length of the OTP to generate.
 * @returns {string} - The generated OTP string.
 */
export function generateOTP(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const index = crypto.randomInt(chars.length);
        otp += chars[index];
    }
    return otp;
}
