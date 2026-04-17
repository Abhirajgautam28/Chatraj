import nodemailer from 'nodemailer';

const DEFAULT_RETRIES = parseInt(process.env.SMTP_RETRY_COUNT || '3', 10);
const DEFAULT_BACKOFF_MS = parseInt(process.env.SMTP_RETRY_BACKOFF_MS || '500', 10);

function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP configuration missing (SMTP_HOST/SMTP_USER/SMTP_PASS)');
  }
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = port === 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '10000', 10),
  });
}

function verifyTransporter(transporter) {
  return new Promise((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err) return reject(err);
      return resolve(success);
    });
  });
}

export async function sendMailWithRetry(mailOptions, opts = {}) {
  const retries = typeof opts.retries === 'number' ? opts.retries : DEFAULT_RETRIES;
  const backoff = typeof opts.backoff === 'number' ? opts.backoff : DEFAULT_BACKOFF_MS;

  const transporter = createTransporter();

  // Best-effort verify; some providers may not support verify(), but
  // a failure here is only informational — we still attempt to send.
  try {
    await verifyTransporter(transporter);
  } catch (err) {
    console.error('SMTP verify failed (continuing to send attempts):', err && err.message ? err.message : err);
  }

  let lastErr = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.info('SMTP: message sent to %s (messageId=%s)', mailOptions.to, info && info.messageId ? info.messageId : 'unknown');
      return info;
    } catch (err) {
      lastErr = err;
      console.error(`SMTP send attempt ${attempt} failed:`, err && err.message ? err.message : err);
      if (attempt < retries) {
        const wait = backoff * Math.pow(2, attempt - 1);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, wait));
      }
    }
  }
  throw lastErr;
}

export default {
  sendMailWithRetry,
};
