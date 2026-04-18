import dotenv from 'dotenv';
dotenv.config();
import redisClient from '../services/redis.service.js';
import { sendMailWithRetry } from '../utils/mailer.js';

async function run() {
  try {
    // Collect keys using SCAN where available to avoid blocking Redis on large datasets.
    let keys = [];
    const keyPattern = 'pending:registration:*';
    if (typeof redisClient.scan === 'function') {
      let cursor = '0';
      do {
        // ioredis returns [nextCursor, results]
        const res = await redisClient.scan(cursor, 'MATCH', keyPattern, 'COUNT', 100);
        const nextCursor = Array.isArray(res) ? res[0] : res.cursor;
        const batch = Array.isArray(res) ? res[1] : res.keys;
        if (Array.isArray(batch) && batch.length > 0) keys.push(...batch);
        cursor = nextCursor;
      } while (cursor !== '0');
    } else if (typeof redisClient.keys === 'function') {
      console.warn('redisClient.scan not available; falling back to KEYS (may block Redis on large datasets)');
      keys = await redisClient.keys(keyPattern);
    } else {
      console.warn('redisClient.scan and keys not available; ensure REDIS_URL is set in production to run this script. Aborting.');
      process.exit(0);
    }

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

          // Update metadata while preserving original TTL where possible.
          pending.lastSentAt = Date.now();
          pending.sentCount = sentCount + 1;
          const newVal = JSON.stringify(pending);

          // Prefer GETSET which preserves TTL on Redis.
          if (typeof redisClient.getset === 'function') {
            try {
              await redisClient.getset(k, newVal);
            } catch (e) {
              // fallback below
              throw e;
            }
          } else {
            // Fallback: read remaining TTL and restore it after set
            let remainingMs = null;
            if (typeof redisClient.pttl === 'function') {
              try {
                remainingMs = await redisClient.pttl(k);
              } catch (e) { remainingMs = null; }
            }
            if (remainingMs == null && typeof redisClient.ttl === 'function') {
              try {
                const secs = await redisClient.ttl(k);
                if (typeof secs === 'number' && secs >= 0) remainingMs = secs * 1000;
              } catch (e) { remainingMs = null; }
            }
            if (remainingMs != null && remainingMs > 0) {
              await redisClient.set(k, newVal);
              if (typeof redisClient.pexpire === 'function') {
                await redisClient.pexpire(k, remainingMs);
              } else if (typeof redisClient.expire === 'function') {
                await redisClient.expire(k, Math.ceil(remainingMs / 1000));
              }
            } else {
              console.warn('Could not preserve TTL for', k, '; skipping metadata update to avoid extending OTP lifetime');
            }
          }

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
