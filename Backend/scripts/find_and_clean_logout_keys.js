#!/usr/bin/env node
import fs from 'fs';
import Redis from 'ioredis';
import { maskKey } from '../utils/strings.js';
import { loadEnv, parseArgs } from './script-utils.js';

loadEnv();

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  console.error('REDIS_URL not found in Backend/.env. Set REDIS_URL or pass via env.');
  process.exit(1);
}

async function run() {
  const rawArgs = parseArgs();
  const opts = {
    delete: rawArgs.delete || rawArgs.d || false,
    dryRun: rawArgs['dry-run'] || (!rawArgs.delete && !rawArgs.d) || false,
    pattern: rawArgs.pattern || '*',
    limit: Number(rawArgs.limit) || 10000
  };
  console.log(`Connecting to Redis (dryRun=${opts.dryRun})`);
  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2 });

  const report = { found: 0, keys: [], deleted: 0, errors: [] };
  const BATCH_SIZE = 200;
  try {
    let cursor = '0';
    let seen = 0;
    let buffer = [];

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
        buffer.push(k);
        seen++;
        if (buffer.length >= BATCH_SIZE) {
          await processBatch(buffer);
          buffer = [];
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
