import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import '../models/project.model.js';
import '../models/user.model.js';

async function sync() {
    console.log('Starting Leaderboard ZSET synchronization...');
    const redis = new Redis(process.env.REDIS_URL);
    await mongoose.connect(process.env.MONGODB_URI);

    const counts = await mongoose.model('project').aggregate([
        { $unwind: "$users" },
        { $group: { _id: "$users", count: { $sum: 1 } } }
    ]);

    console.log(`Processing ${counts.length} users...`);
    const redisPipeline = redis.pipeline();
    redisPipeline.del('user:leaderboard:zset');

    const mongoBulkOps = [];

    for (const item of counts) {
        redisPipeline.zadd('user:leaderboard:zset', item.count, item._id.toString());
        // Batch MongoDB denormalized count updates
        mongoBulkOps.push({
            updateOne: {
                filter: { _id: item._id },
                update: { $set: { projectsCount: item.count } }
            }
        });
    }

    if (mongoBulkOps.length > 0) {
        console.log(`Executing bulk write for ${mongoBulkOps.length} users...`);
        await mongoose.model('user').bulkWrite(mongoBulkOps);
    }

    await redisPipeline.exec();
    console.log('Synchronization complete.');
    process.exit(0);
}

sync().catch(err => {
    console.error(err);
    process.exit(1);
});
