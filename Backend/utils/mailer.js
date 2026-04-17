import nodemailer from 'nodemailer';
import { URL } from 'url';

const DEFAULT_RETRIES = Math.max(1, parseInt(process.env.SMTP_RETRY_COUNT || '3', 10));
const DEFAULT_BACKOFF_MS = parseInt(process.env.SMTP_RETRY_BACKOFF_MS || '500', 10);

let transporterInstance = null;
let transporterConfigHash = null;
let webhookActiveCount = 0;

function missingSmtpKeys() {
  const missing = [];
  if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
  if (!process.env.SMTP_USER) missing.push('SMTP_USER');
  if (!process.env.SMTP_PASS) missing.push('SMTP_PASS');
  return missing;
}

function createTransporter() {
  const cfgHash = `${process.env.SMTP_HOST || ''}|${process.env.SMTP_USER || ''}|${process.env.SMTP_PASS || ''}|${process.env.SMTP_PORT || ''}`;
  // Recreate transporter if config changed
  if (transporterInstance && transporterConfigHash === cfgHash) return transporterInstance;
  const missing = missingSmtpKeys();
  if (missing.length) {
    throw new Error(`SMTP configuration missing: ${missing.join(', ')}`);
  }
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = port === 465;
  // Close old transporter if present
  if (transporterInstance && typeof transporterInstance.close === 'function') {
    try { transporterInstance.close(); } catch (e) { /* ignore */ }
  }

  transporterInstance = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT_MS || '10000', 10),
  });
  transporterConfigHash = cfgHash;
  return transporterInstance;
}

function verifyTransporter(transporter) {
  return new Promise((resolve, reject) => {
    transporter.verify((err, success) => {
      if (err) return reject(err);
      return resolve(success);
    });
  });
}

async function sendWebhookNotification(webhookUrl, payload) {
  // Throttle concurrent webhook notifications to avoid stampeding external
  // services when SMTP is failing hard. If throttled, we drop the notification
  // and log a warning — this is a best-effort alerting mechanism.
  const maxConcurrent = parseInt(process.env.SMTP_FAILURE_WEBHOOK_MAX_CONCURRENT || '2', 10);
  const timeoutMs = parseInt(process.env.SMTP_FAILURE_WEBHOOK_TIMEOUT_MS || '5000', 10);
  if (webhookActiveCount >= maxConcurrent) {
    console.warn('SMTP failure webhook skipped because concurrency limit reached');
    return;
  }

  webhookActiveCount += 1;
  try {
    const u = new URL(webhookUrl);
    const lib = u.protocol === 'https:' ? await import('https') : await import('http');
    const body = JSON.stringify(payload);
    const opts = {
      method: 'POST',
      hostname: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + (u.search || ''),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    await new Promise((resolve, reject) => {
      const req = lib.request(opts, (res) => {
        // consume response
        res.on('data', () => {});
        res.on('end', resolve);
      });
      req.on('error', reject);
      // Timeout handling
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error('Webhook request timed out'));
      });
      try {
        req.write(body);
      } catch (writeErr) {
        reject(writeErr);
      }
      req.end();
    });
  } catch (err) {
    console.error('SMTP failure webhook notify failed:', err && err.message ? err.message : err);
  } finally {
    webhookActiveCount = Math.max(0, webhookActiveCount - 1);
  }
}

export async function sendMailWithRetry(mailOptions, opts = {}) {
  const retries = Math.max(1, (typeof opts.retries === 'number' ? opts.retries : DEFAULT_RETRIES));
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

  // Optionally notify an external webhook that SMTP failed repeatedly.
  if (process.env.SMTP_FAILURE_WEBHOOK) {
    try {
      await sendWebhookNotification(process.env.SMTP_FAILURE_WEBHOOK, {
        timestamp: new Date().toISOString(),
        to: mailOptions.to,
        subject: mailOptions.subject,
        error: (lastErr && (lastErr.message || String(lastErr))) || 'unknown',
      });
    } catch (notifyErr) {
      console.error('Failed to send SMTP failure notification:', notifyErr && notifyErr.message ? notifyErr.message : notifyErr);
    }
  }

  if (lastErr) throw lastErr;
  throw new Error('SMTP send failed after attempts but no error captured');
}

export default {
  sendMailWithRetry,
};
