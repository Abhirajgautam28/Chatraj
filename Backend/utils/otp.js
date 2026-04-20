/**
 * OTP (One-Time Password) generation utility.
 */

/**
 * Generates a random alphanumeric OTP of a specified length.
 *
 * @param {number} [length=6] - The desired length of the OTP.
 * @returns {string} The generated OTP.
 */
export const generateOTP = (length = 6) => {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += characters[Math.floor(Math.random() * characters.length)];
    }
    return otp;
};
