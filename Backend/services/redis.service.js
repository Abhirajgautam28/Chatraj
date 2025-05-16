import Redis from 'ioredis';
import * as dotenv from 'dotenv';
dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('connect', () => {
    console.log('Redis connected');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err.message);
});

export default redisClient;