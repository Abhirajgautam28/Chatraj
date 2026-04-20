import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Load .env from Backend/.env when running from repo root
try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '..', '.env')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) { dotenv.config({ path: p }); break; }
  }
} catch (e) { dotenv.config(); }

import redisClient from '../services/redis.service.js';
import { sendMailWithRetry } from '../utils/mailer.js';
import { safeParsePendingRegistration, maskEmailForLogs } from '../utils/pendingRegistration.js';

const SCAN_SAFETY_LIMIT = parseInt(process.env.REDIS_SCAN_SAFETY_LIMIT || '10000', 10);

async function run() {
  try {
    // Collect keys using SCAN where available to avoid blocking Redis on large datasets.
    let keys = [];
    const keyPattern = 'pending:registration:*';
    if (typeof redisClient.scan === 'function') {
      let cursor = '0';
      let safety = 0;
      do {
        // ioredis typically returns [nextCursor, keys]
        const res = await redisClient.scan(cursor, 'MATCH', keyPattern, 'COUNT', 100);
        let nextCursor;
        let batch;
        if (Array.isArray(res) && res.length >= 2) {
          nextCursor = res[0];
          batch = res[1];
        } else if (res && typeof res === 'object' && ('cursor' in res) && Array.isArray(res.keys)) {
          nextCursor = res.cursor;
          batch = res.keys;
        } else {
          console.warn('Unexpected SCAN response shape; aborting scan to avoid silent failure');
          break;
        }
        if (Array.isArray(batch) && batch.length > 0) keys.push(...batch);
        cursor = String(nextCursor);
        // safety to avoid potential infinite loops in case of unexpected cursor behavior
        if (++safety > SCAN_SAFETY_LIMIT) {
          console.warn('SCAN loop exceeded safety limit; aborting');
          break;
        }
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
        const pending = safeParsePendingRegistration(v, k);
        if (!pending) {
          // Skip corrupted entry
          continue;
        }
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

          // Prefer GETSET which preserves TTL on Redis. If GETSET fails,
          // log and fall back to TTL-preserving update instead of aborting.
          let updatedViaGetSet = false;
          if (typeof redisClient.getset === 'function') {
            try {
              await redisClient.getset(k, newVal);
              updatedViaGetSet = true;
            } catch (e) {
              console.warn('redis GETSET failed for', k, '— falling back to TTL-preserving set:', e && e.message ? e.message : e);
            }
          }

          if (!updatedViaGetSet) {
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

          console.info('Resent OTP to', maskEmailForLogs(pending.email));
        } catch (err) {
          console.error('Failed to resend to', maskEmailForLogs(pending.email), err && err.message ? err.message : err);
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
