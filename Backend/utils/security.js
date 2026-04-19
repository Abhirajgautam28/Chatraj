import crypto from 'crypto';

// Utilities around exposing sensitive data in responses.
// By default we are conservative: do NOT expose OTPs unless explicitly
// enabled via EXPOSE_OTP=true. This avoids accidental leaks when
// `NODE_ENV` is unset or misconfigured on hosted environments.
export function shouldExposeOtpToClient() {
  // Require an explicit opt-in via EXPOSE_OTP=true and ensure not running
  // in CI environments. This avoids accidental exposure in staging/dev.
  const expose = String(process.env.EXPOSE_OTP || '').toLowerCase() === 'true';
  const ci = String(process.env.CI || '').toLowerCase() === 'true';
  return expose && !ci;
}

// Helper: Generate 7-char OTP
export function generateOTP(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const index = crypto.randomInt(chars.length);
        otp += chars[index];
    }
    return otp;
}
