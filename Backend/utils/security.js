// Utilities around exposing sensitive data in responses.
// By default we are conservative: do NOT expose OTPs unless explicitly
// enabled via EXPOSE_OTP=true. This avoids accidental leaks when
// `NODE_ENV` is unset or misconfigured on hosted environments.
export function shouldExposeOtpToClient() {
  return String(process.env.EXPOSE_OTP || '').toLowerCase() === 'true';
}

export default shouldExposeOtpToClient;
