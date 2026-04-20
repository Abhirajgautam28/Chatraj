import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function sync() {
    console.log('Starting Leaderboard ZSET synchronization...');
    const redis = new Redis(process.env.REDIS_URL);
    await mongoose.connect(process.env.MONGODB_URI);

    const counts = await mongoose.model('project').aggregate([
        { $unwind: "$users" },
        { $group: { _id: "$users", count: { $sum: 1 } } }
    ]);

    console.log(`Processing ${counts.length} users...`);
    const pipeline = redis.pipeline();
    pipeline.del('user:leaderboard:zset');

    for (const item of counts) {
        pipeline.zadd('user:leaderboard:zset', item.count, item._id.toString());
    }

    await pipeline.exec();
    console.log('Synchronization complete.');
    process.exit(0);
}

sync().catch(err => {
    console.error(err);
    process.exit(1);
});
