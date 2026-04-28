import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import { URL } from 'url';
import { Buffer } from 'buffer';
import https from 'https';
import http from 'http';

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

async function sendViaSendGrid(mailOptions) {
  if (!process.env.SENDGRID_API_KEY) throw new Error('SendGrid API key not configured');
  const parseAddress = (addr) => {
    if (!addr) return 'no-reply@chatraj.com';
    const match = /<([^>]+)>/.exec(addr);
    if (match) return match[1];
    return addr.includes('@') ? addr : 'no-reply@chatraj.com';
  };

  const payload = {
    personalizations: [
      {
        to: [
          {
            email: parseAddress(mailOptions.to),
          },
        ],
      },
    ],
    from: {
      email: parseAddress(mailOptions.from || process.env.SMTP_FROM || 'no-reply@chatraj.com'),
    },
    subject: mailOptions.subject || '(no subject)',
    content: [],
  };

  if (mailOptions.text) payload.content.push({ type: 'text/plain', value: mailOptions.text });
  if (mailOptions.html) payload.content.push({ type: 'text/html', value: mailOptions.html });
  if (!payload.content.length) payload.content.push({ type: 'text/plain', value: '' });

  const u = new URL('https://api.sendgrid.com/v3/mail/send');
  const body = JSON.stringify(payload);
  const opts = {
    method: 'POST',
    hostname: u.hostname,
    port: u.port || 443,
    path: u.pathname,
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  await new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve();
        return reject(new Error(`SendGrid failed: ${res.statusCode} ${buf.toString()}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
  logger.info('SendGrid: message queued to %s', mailOptions.to);
}

async function sendViaEthereal(mailOptions) {
  // Development-only fallback using Ethereal (nodemailer test SMTP)
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  const info = await transporter.sendMail(mailOptions);
  try {
    const url = nodemailer.getTestMessageUrl(info);
    logger.info('Ethereal message URL:', url);
  } catch (e) {
    // ignore
  }
  return info;
}

async function sendWebhookNotification(webhookUrl, payload) {
  // Throttle concurrent webhook notifications to avoid stampeding external
  // services when SMTP is failing hard. If throttled, we drop the notification
  // and log a warning — this is a best-effort alerting mechanism.
  const maxConcurrent = parseInt(process.env.SMTP_FAILURE_WEBHOOK_MAX_CONCURRENT || '2', 10);
  const timeoutMs = parseInt(process.env.SMTP_FAILURE_WEBHOOK_TIMEOUT_MS || '5000', 10);
  if (webhookActiveCount >= maxConcurrent) {
    logger.warn('SMTP failure webhook skipped because concurrency limit reached');
    return;
  }

  webhookActiveCount += 1;
  try {
    const u = new URL(webhookUrl);
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
      const lib = u.protocol === 'https:' ? https : http;
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
    logger.error('SMTP failure webhook notify failed:', err && err.message ? err.message : err);
  } finally {
    webhookActiveCount = Math.max(0, webhookActiveCount - 1);
  }
}

export async function sendMailWithRetry(mailOptions, opts = {}) {
  const retries = Math.max(1, (typeof opts.retries === 'number' ? opts.retries : DEFAULT_RETRIES));
  const backoff = typeof opts.backoff === 'number' ? opts.backoff : DEFAULT_BACKOFF_MS;

  const hasSmtp = missingSmtpKeys().length === 0;
  const hasSendGrid = Boolean(process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.trim());
  const allowEthereal = Boolean(process.env.EMAIL_TEST_FALLBACK === 'true' || (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production'));

  // If no provider is configured, fail fast instead of looping no-op retries.
  if (!hasSmtp && !hasSendGrid && !allowEthereal) {
    throw new Error('No email provider configured: set SMTP_* env vars or SENDGRID_API_KEY, or enable EMAIL_TEST_FALLBACK in development');
  }

  let lastErr = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    // Prefer SendGrid for hosted environments (many hosts block direct SMTP)
    if (hasSendGrid) {
      try {
        await sendViaSendGrid(mailOptions);
        return { provider: 'sendgrid', to: mailOptions.to };
      } catch (err) {
        lastErr = err;
        logger.error(`SendGrid attempt ${attempt} failed:`, err && err.message ? err.message : err);
      }
    }

    // Try SMTP if configured
    if (hasSmtp) {
      try {
        const transporter = createTransporter();
        try {
          await verifyTransporter(transporter);
        } catch (vErr) {
          logger.error('SMTP verify failed (continuing to send attempts):', vErr && vErr.message ? vErr.message : vErr);
        }
        const info = await transporter.sendMail(mailOptions);
        logger.info('SMTP: message sent to %s (messageId=%s)', mailOptions.to, info && info.messageId ? info.messageId : 'unknown');
        return info;
      } catch (err) {
        lastErr = err;
        logger.error(`SMTP send attempt ${attempt} failed:`, err && err.message ? err.message : err);
      }
    }

    // Development ethereal fallback
    if (allowEthereal) {
      try {
        const info = await sendViaEthereal(mailOptions);
        logger.info('Ethereal: message sent to %s (id=%s)', mailOptions.to, info && info.messageId ? info.messageId : 'unknown');
        return info;
      } catch (err) {
        lastErr = err;
        logger.error(`Ethereal attempt ${attempt} failed:`, err && err.message ? err.message : err);
      }
    }

    if (attempt < retries) {
      const wait = backoff * Math.pow(2, attempt - 1);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }

  // Optionally notify an external webhook that SMTP/SendGrid failed repeatedly.
  if (process.env.SMTP_FAILURE_WEBHOOK) {
    try {
      await sendWebhookNotification(process.env.SMTP_FAILURE_WEBHOOK, {
        timestamp: new Date().toISOString(),
        to: mailOptions.to,
        subject: mailOptions.subject,
        error: (lastErr && (lastErr.message || String(lastErr))) || 'unknown',
      });
    } catch (notifyErr) {
      logger.error('Failed to send SMTP failure notification:', notifyErr && notifyErr.message ? notifyErr.message : notifyErr);
    }
  }

  if (lastErr) throw lastErr;
  throw new Error('No email provider configured (SMTP or SENDGRID) and ethereal fallback not allowed');
}

export default {
  sendMailWithRetry,
};
 