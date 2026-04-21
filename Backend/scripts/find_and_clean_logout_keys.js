#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Redis from 'ioredis';

// Load Backend .env relative to this script file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error('REDIS_URL not found in Backend/.env. Set REDIS_URL or pass via env.');
  process.exit(1);
}

function maskKey(k) {
  if (!k) return '';
  if (k.length <= 12) return k.slice(0, 3) + '...' + k.slice(-3);
  return k.slice(0, 6) + '...' + k.slice(-6);
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    delete: args.includes('--delete') || args.includes('-d'),
    dryRun: args.includes('--dry-run') || (!args.includes('--delete') && !args.includes('-d')),
    pattern: (() => {
      const p = args.find(a => a.startsWith('--pattern='));
      if (p) return p.split('=')[1];
      const idx = args.indexOf('--pattern');
      if (idx !== -1 && args[idx+1]) return args[idx+1];
      return '*';
    })(),
    limit: (() => {
      const l = args.find(a => a.startsWith('--limit='));
      if (l) {
        const n = Number(l.split('=')[1]);
        return Number.isNaN(n) ? 10000 : n;
      }
      return 10000;
    })()
  };
}

async function run() {
  const opts = parseArgs();
  console.log(`Connecting to Redis (dryRun=${opts.dryRun})`);
  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2 });

  const report = { found: 0, keys: [], deleted: 0, errors: [] };
  const BATCH_SIZE = 200;
  try {
    let cursor = '0';
    let seen = 0;
    let buffer = [];
    const processedKeys = new Map();
    const MAX_PROCESSED_KEYS = 50000; // Limit size to prevent OOM

    const processBatch = async (keys) => {
      if (!keys || keys.length === 0) return;
      const pipeline = redis.pipeline();
      for (const k of keys) {
        pipeline.type(k);
        pipeline.get(k);
        pipeline.ttl(k);
      }
      const results = await pipeline.exec();
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const typeRes = results[3 * i];
        const getRes = results[3 * i + 1];
        const ttlRes = results[3 * i + 2];

        if (typeRes && typeRes[0]) {
          report.errors.push({ key: maskKey(k), error: String(typeRes[0].message || typeRes[0]) });
          continue;
        }
        const type = typeRes ? typeRes[1] : null;
        if (type !== 'string') continue;

        if (getRes && getRes[0]) {
          report.errors.push({ key: maskKey(k), error: String(getRes[0].message || getRes[0]) });
          continue;
        }
        const val = getRes ? getRes[1] : null;
        if (val === 'logout') {
          const ttl = (ttlRes && !ttlRes[0]) ? ttlRes[1] : -2;
          report.found++;
          report.keys.push({ key: maskKey(k), ttl: ttl });
          if (opts.delete) {
            try {
              const delRes = await redis.del(k);
              if (delRes) report.deleted++;
            } catch (e) {
              report.errors.push({ key: maskKey(k), error: String(e && (e.message || e)) });
            }
          }
        }
      }
    };

    do {
      const res = await redis.scan(cursor, 'MATCH', opts.pattern, 'COUNT', 1000);
      cursor = res[0];
      const keys = res[1] || [];
      for (const k of keys) {
        if (!processedKeys.has(k)) {
          // Optimization: Sliding window deduplication using Map for deterministic cleanup
          processedKeys.set(k, Date.now());

          // Clear oldest keys if limit reached
          if (processedKeys.size > MAX_PROCESSED_KEYS) {
              const oldestKey = processedKeys.keys().next().value;
              processedKeys.delete(oldestKey);
          }

          buffer.push(k);
          seen++;
          if (buffer.length >= BATCH_SIZE) {
            await processBatch(buffer);
            buffer = [];
          }
        }
        if (seen >= opts.limit) break;
      }
      if (seen >= opts.limit) break;
    } while (cursor !== '0');

    if (buffer.length) await processBatch(buffer);

    const outDir = path.resolve(__dirname, '..', 'logs');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `redis_cleanup_report_${Date.now()}.json`);
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

    console.log(`Report written to: ${outPath}`);
    console.log(`Found ${report.found} blacklist keys (value==='logout').`);
    if (report.keys.length) console.table(report.keys.slice(0, 200));
    if (report.errors.length) console.warn('Errors:', report.errors);
    if (opts.delete) console.log(`Deleted ${report.deleted} keys.`);
    else console.log('Dry-run mode: no keys were deleted. Re-run with --delete to remove listed keys.');
  } catch (err) {
    console.error('Error during redis scan:', err && (err.stack || err.message || err));
  } finally {
    try { await redis.quit(); } catch (e) { }
  }
}

run().catch(err => { console.error(err && (err.stack || err.message || err)); process.exit(1); });
