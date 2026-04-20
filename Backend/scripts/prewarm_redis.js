import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function prewarm() {
    console.log('Pre-warming Redis cache with common data...');
    const redis = new Redis(process.env.REDIS_URL);

    const categories = [
      'DSA', 'Frontend Development', 'Backend Development', 'Fullstack Development',
      'Code Review & Optimization', 'Testing & QA', 'API Development',
      'Database Engineering', 'Software Architecture', 'Version Control & Git',
      'Agile Project Management', 'CI/CD Automation', 'Debugging & Troubleshooting',
      'Documentation Generation', 'Code Refactoring'
    ];

    const pipeline = redis.pipeline();
    pipeline.set('app:categories', JSON.stringify(categories), 'EX', 86400);

    // Add other system-wide defaults here
    pipeline.set('app:version', '1.0.0-optimized', 'EX', 86400);

    await pipeline.exec();
    console.log('Pre-warming complete.');
    process.exit(0);
}

prewarm().catch(err => {
    console.error(err);
    process.exit(1);
});
