import mongoose from 'mongoose';
import redisClient from './redis.service.js';
import logger from '../utils/logger.js';

export const checkHealth = async () => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            database: 'unknown',
            redis: 'unknown'
        }
    };

    try {
        if (mongoose.connection.readyState === 1) {
            health.services.database = 'connected';
        } else {
            health.status = 'unhealthy';
            health.services.database = 'disconnected';
        }
    } catch (err) {
        health.status = 'unhealthy';
        health.services.database = 'error';
        logger.error('Health check database error:', err);
    }

    try {
        const ping = await redisClient.set('health-check', 'ok', 'EX', 10);
        if (ping === 'OK') {
            health.services.redis = 'connected';
        } else {
            health.status = 'unhealthy';
            health.services.redis = 'degraded';
        }
    } catch (err) {
        health.services.redis = 'error';
        logger.error('Health check redis error:', err);
    }

    return health;
};

export default { checkHealth };
