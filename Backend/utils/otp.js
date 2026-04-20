import crypto from 'crypto';

/**
 * Generates a random alphanumeric OTP of specified length.
 * @param {number} length - The length of the OTP.
 * @returns {string} - The generated OTP.
 */
export const generateOTP = (length = 7) => {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
	let otp = '';
	for (let i = 0; i < length; i++) {
		const index = crypto.randomInt(chars.length);
		otp += chars[index];
	}
	return otp;
};

export default generateOTP;
