import crypto from 'crypto';

/**
 * Generates a random alphanumeric OTP of specified length.
 * @param {number} length - The length of the OTP.
 * @returns {string} - The generated OTP.
 */
export const generateOTP = (length = 7) => {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
	const otp = new Array(length);
	for (let i = 0; i < length; i++) {
		const index = crypto.randomInt(chars.length);
		otp[i] = chars[index];
	}
	return otp.join('');
};

export default generateOTP;
