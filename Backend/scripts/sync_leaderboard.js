import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Load models
import '../models/user.model.js';
import '../models/project.model.js';

async function syncLeaderboard() {
    console.log('Starting Atomic Leaderboard Synchronization...');
    const redis = new Redis(process.env.REDIS_URL);
    await mongoose.connect(process.env.MONGODB_URI);

    try {
        // 1. Aggregate project counts per user using MongoDB Aggregation
        console.log('Aggregating project counts...');
        const counts = await mongoose.model('project').aggregate([
            { $unwind: "$users" },
            { $group: { _id: "$users", count: { $sum: 1 } } }
        ]);

        console.log(`Found ${counts.length} active users.`);

        // 2. Sync to Redis ZSET and Update MongoDB in Bulk
        const redisPipeline = redis.pipeline();
        const mongoBulkOps = [];

        // Clear existing ZSET to ensure fresh state
        redisPipeline.del('user:leaderboard:zset');

        for (const item of counts) {
            const userId = item._id.toString();
            const projectCount = item.count;

            redisPipeline.zadd('user:leaderboard:zset', projectCount, userId);

            mongoBulkOps.push({
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { projectsCount: projectCount } }
                }
            });
        }

        console.log('Executing Atomic Updates...');
        if (mongoBulkOps.length > 0) {
            await mongoose.model('user').bulkWrite(mongoBulkOps);
        }
        await redisPipeline.exec();

        console.log('✅ Leaderboard synchronization complete.');
    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        await mongoose.disconnect();
        await redis.quit();
        process.exit(0);
    }
}

syncLeaderboard();
