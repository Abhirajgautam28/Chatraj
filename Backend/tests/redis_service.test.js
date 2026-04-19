import redisClient from '../services/redis.service.js';

describe('Redis Service (In-Memory Mock)', () => {
    // These tests only run if the fallback mock is used (REDIS_URL not set)
    // Or we can just test the logic of the mock.

    beforeEach(async () => {
        if (typeof redisClient.quit === 'function') {
            await redisClient.quit();
        }
    });

    test('should set and get values', async () => {
        await redisClient.set('key', 'value');
        const val = await redisClient.get('key');
        expect(val).toBe('value');
    });

    test('should handle expiration (EX)', async () => {
        jest.useFakeTimers();
        await redisClient.set('key', 'value', 'EX', 10);
        expect(await redisClient.get('key')).toBe('value');

        jest.advanceTimersByTime(11000);
        expect(await redisClient.get('key')).toBeNull();
        jest.useRealTimers();
    });

    test('should delete keys', async () => {
        await redisClient.set('key', 'value');
        const deleted = await redisClient.del('key');
        expect(deleted).toBe(1);
        expect(await redisClient.get('key')).toBeNull();
    });

    test('should handle increment/decrement', async () => {
        await redisClient.set('counter', '10');
        const next = await redisClient.incr('counter');
        expect(next).toBe(11);

        const prev = await redisClient.decr('counter');
        expect(prev).toBe(10);
    });
});
