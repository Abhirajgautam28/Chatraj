import dotenv from 'dotenv';
dotenv.config();
import redisClient from '../services/redis.service.js';
import { sendMailWithRetry } from '../utils/mailer.js';

async function run() {
  try {
    if (typeof redisClient.keys !== 'function') {
      console.warn('redisClient.keys not available; ensure REDIS_URL is set in production to run this script. Aborting.');
      process.exit(0);
    }

    const keys = await redisClient.keys('pending:registration:*');
    if (!keys || keys.length === 0) {
      console.info('No pending registrations found');
      process.exit(0);
    }

    const ttlDefault = parseInt(process.env.REGISTRATION_OTP_TTL_SECONDS || '900', 10);
    const maxAttempts = parseInt(process.env.REGISTRATION_SEND_RETRY_ATTEMPTS || '5', 10);

    for (const k of keys) {
      try {
        const v = await redisClient.get(k);
        if (!v) continue;
        const pending = JSON.parse(v);
        const sentCount = Number(pending.sentCount || 0);
        if (sentCount >= maxAttempts) {
          console.info('Max attempts reached for', pending.email);
          continue;
        }

        try {
          await sendMailWithRetry({
            from: process.env.SMTP_FROM || 'ChatRaj <no-reply@chatraj.com>',
            to: pending.email,
            subject: 'Your ChatRaj OTP Verification',
            text: `Welcome to ChatRaj!\n\nYour OTP is: ${pending.otp}\n\nPlease enter this code in the registration popup to activate your account.`,
          }, { retries: 3 });

          pending.lastSentAt = Date.now();
          pending.sentCount = sentCount + 1;
          await redisClient.set(k, JSON.stringify(pending), 'EX', ttlDefault);
          console.info('Resent OTP to', pending.email);
        } catch (err) {
          console.error('Failed to resend to', pending.email, err && err.message ? err.message : err);
        }
      } catch (err) {
        console.error('Error processing pending key', k, err && err.message ? err.message : err);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Fatal error in retry script', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();
