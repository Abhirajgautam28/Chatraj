#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Redis from 'ioredis';

// Load Backend .env
dotenv.config({ path: path.resolve(process.cwd(), 'Backend/.env') });

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
      if (l) return Number(l.split('=')[1]) || 10000;
      return 10000;
    })()
  };
}

async function run() {
  const opts = parseArgs();
  console.log(`Connecting to Redis (dryRun=${opts.dryRun})`);
  const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 2 });

  const report = { found: 0, keys: [], deleted: 0, errors: [] };
  try {
    let cursor = '0';
    let seen = 0;
    do {
      const res = await redis.scan(cursor, 'MATCH', opts.pattern, 'COUNT', 1000);
      cursor = res[0];
      const keys = res[1] || [];
      for (const k of keys) {
        seen++;
        try {
          const type = await redis.type(k);
          if (type !== 'string') continue;
          const val = await redis.get(k);
          if (val === 'logout') {
            const ttl = await redis.ttl(k);
            report.found++;
            report.keys.push({ key: maskKey(k), ttl: ttl });
            if (opts.delete) {
              const delRes = await redis.del(k);
              if (delRes) report.deleted++;
            }
          }
        } catch (e) {
          report.errors.push({ key: maskKey(k), error: String(e && (e.message || e)) });
        }
        if (seen >= opts.limit) break;
      }
      if (seen >= opts.limit) break;
    } while (cursor !== '0');

    const outDir = path.resolve(process.cwd(), 'Backend', 'logs');
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
